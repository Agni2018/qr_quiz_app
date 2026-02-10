const mongoose = require('mongoose');
const Topic = require('../models/Topic');
const Question = require('../models/Question');
const UserAttempt = require('../models/UserAttempt');
const User = require('../models/User');
const Badge = require('../models/Badge');

// Check eligibility to start quiz
exports.startQuiz = async (req, res) => {
    const { topicId, name, email, phone } = req.body;

    if (!topicId || !email || !phone || !name) {
        return res.status(400).json({ message: 'Missing details' });
    }

    // Phone number validation: 10 digits
    if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number. Must be 10 digits.' });
    }

    try {
        const topic = await Topic.findById(topicId);
        if (!topic || topic.status !== 'active') {
            return res.status(404).json({ message: 'Quiz not active or found' });
        }

        // 1. Check for existing attempt FIRST (Priority)
        // Only include phone in check if it's not 'N/A' to avoid collisions for logged-in users
        const attemptFilter = {
            topicId,
            $or: [{ "user.email": email }]
        };
        if (phone && phone !== 'N/A') {
            attemptFilter.$or.push({ "user.phone": phone });
        }

        const existingAttempt = await UserAttempt.findOne(attemptFilter);
        if (existingAttempt) {
            return res.status(400).json({
                message: 'You have already attempted this quiz.',
                attemptId: existingAttempt._id
            });
        }

        res.json({ message: 'Access granted', canAttempt: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Submit Quiz
exports.submitQuiz = async (req, res) => {
    const { topicId, user, answers, timeTaken, userId } = req.body;

    if (!topicId || !user || !answers) {
        return res.status(400).json({ message: 'Invalid submission data' });
    }

    // Phone number validation: 10 digits
    if (user?.phone && !/^\d{10}$/.test(user.phone)) {
        return res.status(400).json({ message: 'Invalid phone number. Must be 10 digits.' });
    }

    // Validate IDs to prevent CastErrors
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
        return res.status(400).json({ message: 'Invalid Topic ID' });
    }

    let finalUserId = null;
    let foundByEmail = false;

    try {
        // 1. ALWAYS prefer matching by the explicitly provided email if it belongs to a User
        if (user && user.email) {
            console.log(`[DEBUG] Searching for student by email: ${user.email}`);
            const matchedUser = await User.findOne({ email: user.email });
            if (matchedUser) {
                finalUserId = matchedUser._id;
                foundByEmail = true;
                console.log(`[DEBUG] Found matching user: ${matchedUser.username} (${matchedUser.role})`);
            } else {
                console.log(`[DEBUG] No user found with email: ${user.email}`);
            }
        }

        // 2. Fallback to provided userId ONLY if no email was provided
        if (!finalUserId && !user?.email && userId && mongoose.Types.ObjectId.isValid(userId)) {
            finalUserId = userId;
            console.log(`[DEBUG] Falling back to provided userId: ${userId}`);
        } else if (!finalUserId && user?.email) {
            console.log(`[DEBUG] Email was provided but no match found. Points will NOT be awarded to guests or mismatched IDs.`);
        }

        const topic = await Topic.findById(topicId);
        if (!topic) return res.status(404).json({ message: 'Topic not found' });

        const existingAttempt = await UserAttempt.findOne({
            topicId,
            $or: [
                { "user.email": user.email },
                { "user.phone": user.phone }
            ]
        });

        if (existingAttempt) {
            return res.status(400).json({ message: 'Duplicate submission detected' });
        }

        const questions = await Question.find({ topicId });
        let rawScore = 0;
        const processedAnswers = [];

        // Scoring Logic
        for (let ans of answers) {
            const question = questions.find(q => q._id.toString() === ans.questionId);
            if (!question) continue;

            let valid = false;
            const qType = question.type;
            const correct = question.correctAnswer;
            const submitted = ans.submittedAnswer;

            if (!question.correctAnswer) {
                // Determine if valid based on logic, but if correct answer is missing, default to false.
                valid = false;
            } else if (qType === 'true_false' || qType === 'single_choice' || qType === 'fill_blank') {
                const subStr = String(submitted || '').trim().toLowerCase();
                const corStr = String(correct || '').trim().toLowerCase();
                if (subStr && corStr && subStr === corStr) {
                    valid = true;
                }
            } else if (qType === 'multi_select') {
                if (Array.isArray(submitted) && Array.isArray(correct) && submitted.length > 0) {
                    const s = [...submitted].map(v => String(v).trim().toLowerCase()).sort();
                    const c = [...correct].map(v => String(v).trim().toLowerCase()).sort();
                    valid = JSON.stringify(s) === JSON.stringify(c);
                }
            } else if (qType === 'match' || qType === 'reorder' || qType === 'sort') {
                valid = JSON.stringify(submitted) === JSON.stringify(correct);
            }

            let marks = 0;
            if (valid) {
                marks = question.marks || 1;
            } else {
                marks = -(Number(topic.negativeMarking) || 0);
            }
            rawScore += marks;

            processedAnswers.push({
                questionId: question._id,
                submittedAnswer: submitted,
                isCorrect: valid,
                marksObtained: marks
            });
        }

        let totalScore = rawScore;
        let timeBonus = 0;

        // Time-based scoring: Bonus for finishing fast
        if (topic.timeBasedScoring && topic.timeLimit > 0 && timeTaken < topic.timeLimit) {
            const timeSavedRatio = (topic.timeLimit - timeTaken) / topic.timeLimit;
            timeBonus = Math.round(rawScore * 0.1 * timeSavedRatio); // up to 10% bonus
            totalScore += timeBonus;
        }

        const attempt = new UserAttempt({
            topicId,
            userId: finalUserId,
            user,
            answers: processedAnswers,
            score: totalScore
        });

        try {
            await attempt.save();
        } catch (saveErr) {
            // Handle duplicate key error (race condition or double submit)
            if (saveErr.code === 11000) {
                // Fetch the existing attempt using the same fields involved in the unique index
                const existing = await UserAttempt.findOne({
                    topicId,
                    "user.email": user.email,
                    "user.phone": user.phone
                });

                if (existing) {
                    return res.json({
                        message: 'You have already attempted this quiz',
                        score: existing.score,
                        attemptId: existing._id,
                        // Provide default values
                        rawScore: existing.score,
                        timeBonus: 0,
                        pointsEarned: 0,
                        badgesAwarded: []
                    });
                } else {
                    // Fallback if not found (unexpected)
                    return res.status(200).json({
                        message: 'You have already attempted this quiz',
                        attemptId: null
                    });
                }
            }
            throw saveErr; // Re-throw if it's not a duplicate key error
        }

        // Award points and check for badges
        let pointsEarned = 0;
        let badgesAwarded = [];

        console.log(`[DEBUG] Attempting point award. finalUserId: ${finalUserId}`);
        if (finalUserId) {
            const userDoc = await User.findById(finalUserId);
            if (!userDoc) {
                console.log(`[DEBUG] No User document found for ID: ${finalUserId}`);
            } else if (userDoc.role !== 'student') {
                console.log(`[DEBUG] User found but is NOT a student (Role: ${userDoc.role}). Points skipped.`);
            } else {
                console.log(`[DEBUG] Processing student: ${userDoc.username} (Current Points: ${userDoc.points})`);
                // Points for quiz performance: Exactly +1 for completing the quiz with at least one correct answer
                const hasCorrectAnswer = processedAnswers.some(ans => ans.isCorrect);
                console.log(`[DEBUG] hasCorrectAnswer: ${hasCorrectAnswer}`);

                if (hasCorrectAnswer) {
                    pointsEarned = 1;
                    userDoc.points += pointsEarned;
                    console.log(`[DEBUG] Awarded +1 point. New Balance: ${userDoc.points}`);
                }

                // Check for "Quiz Master" badge (100% score)
                const maxPossibleScore = questions.reduce((sum, q) => sum + (q.marks || 1), 0);
                if (rawScore >= maxPossibleScore && maxPossibleScore > 0) {
                    let badge = await Badge.findOne({ name: 'Quiz Master' });
                    if (!badge) {
                        badge = new Badge({
                            name: 'Quiz Master',
                            description: 'Scored 100% on a quiz',
                            type: 'quiz_perfect',
                            threshold: 100
                        });
                        await badge.save();
                    }

                    const alreadyHas = userDoc.badges.find(b => b.badgeId.toString() === badge._id.toString());
                    if (!alreadyHas) {
                        userDoc.badges.push({ badgeId: badge._id });
                        badgesAwarded.push(badge.name);
                        console.log(`[DEBUG] Badge earned: Quiz Master`);
                    }
                }

                await userDoc.save();
                console.log(`[DEBUG] userDoc saved successfully for ${userDoc.username}`);
            }
        } else {
            console.log(`[DEBUG] No finalUserId identified. Points will NOT be awarded.`);
        }

        res.json({
            message: 'Quiz submitted successfully',
            score: totalScore,
            rawScore,
            timeBonus,
            attemptId: attempt._id,
            pointsEarned,
            badgesAwarded
        });

    } catch (err) {
        console.error('Quiz Submission Error:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get Result
exports.getResult = async (req, res) => {
    try {
        const attempt = await UserAttempt.findById(req.params.attemptId)
            .populate('topicId', 'name');
        if (!attempt) return res.status(404).json({ message: 'Result not found' });
        res.json(attempt);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const attempts = await UserAttempt.find({ topicId: req.params.topicId })
            .sort({ score: -1, completedAt: 1 })
            .limit(20)
            .select('user.name score completedAt');

        res.json(attempts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get student's quiz attempts with ranks
exports.getStudentAttempts = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const attempts = await UserAttempt.find({
            $or: [
                { userId: req.user.id },
                {
                    $and: [
                        { "user.email": user.email },
                        { "user.name": user.username }
                    ]
                }
            ]
        })
            .populate('topicId', 'name description')
            .sort({ completedAt: -1 });

        // Filter out attempts where the topic no longer exists
        const validAttempts = attempts.filter(a => a.topicId);

        // Calculate rank for each attempt
        const enrichedAttempts = await Promise.all(validAttempts.map(async (attempt) => {
            // Rank is 1 + number of people with higher score OR same score but earlier completion
            const rank = await UserAttempt.countDocuments({
                topicId: attempt.topicId._id,
                $or: [
                    { score: { $gt: attempt.score } },
                    { score: attempt.score, completedAt: { $lt: attempt.completedAt } }
                ]
            }) + 1;

            return {
                ...attempt._doc,
                rank
            };
        }));

        res.json(enrichedAttempts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Certify Students for a topic
exports.certifyStudents = async (req, res) => {
    try {
        const { topicId } = req.params;

        // Find all attempts for this topic that are NOT certified and have score > 1
        // (Assuming 1 mark per question, score > 1 means more than one correct answers)
        // Wait, the requirement is "only for the students who have gotten more than one correct answer"
        // Let's filter based on isCorrect: true in the answers array

        const attempts = await UserAttempt.find({
            topicId,
            isCertified: { $ne: true }
        });

        const qualifiedAttempts = attempts.filter(attempt => {
            const correctCount = (attempt.answers || []).filter(ans => ans.isCorrect).length;
            return correctCount > 0;
        });

        if (qualifiedAttempts.length === 0) {
            return res.json({ message: 'No new students to certify', count: 0 });
        }

        const attemptIds = qualifiedAttempts.map(a => a._id);

        await UserAttempt.updateMany(
            { _id: { $in: attemptIds } },
            {
                $set: {
                    isCertified: true,
                    certifiedAt: new Date()
                }
            }
        );

        res.json({
            message: `Successfully certified ${qualifiedAttempts.length} students`,
            count: qualifiedAttempts.length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get certificates for logged-in student
exports.getStudentCertificates = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const certificates = await UserAttempt.find({
            $or: [
                { userId: req.user.id },
                {
                    $and: [
                        { "user.email": user.email },
                        { "user.name": user.username }
                    ]
                }
            ],
            isCertified: true
        })
            .populate('topicId', 'name description')
            .sort({ certifiedAt: -1 });

        // Filter out cases where topic might be deleted
        const validCertificates = certificates.filter(c => c.topicId);

        res.json(validCertificates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
