import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Level from '../src/models/Level.js';
import Module from '../src/models/Module.js';
import Quiz from '../src/models/Quiz.js';

dotenv.config();

// Hardcoded data with high-quality quizzes
const levelsData = [
    {
        title: "Integers",
        description: "Understanding positive and negative whole numbers",
        content: [
            "Integers are whole numbers that include positive numbers, negative numbers, and zero. They do not include fractions or decimals.",
            "Integers are used to represent quantities that can go above or below zero, such as temperature, bank balances, or elevation.",
            "### Operations with Integers",
            "Adding integers follows specific rules: When adding two positive integers, the result is positive. When adding two negative integers, the result is negative.",
            "When adding integers with different signs, subtract the smaller absolute value from the larger absolute value and use the sign of the integer with the larger absolute value.",
            "Subtracting an integer is the same as adding its opposite. For example, 5 - 3 is the same as 5 + (-3)."
        ],
        quizQuestions: [
            {
                question: "What are integers?",
                options: ["Whole numbers and fractions", "Only positive numbers", "Whole numbers: positive, negative, and zero", "Decimal numbers"],
                correctAnswer: "Whole numbers: positive, negative, and zero"
            },
            {
                question: "Which of the following is NOT an integer?",
                options: ["-5", "0", "3.5", "100"],
                correctAnswer: "3.5"
            },
            {
                question: "What is the result of adding two negative integers?",
                options: ["Positive", "Negative", "Zero", "It depends"],
                correctAnswer: "Negative"
            },
            {
                question: "Calculate: 5 + (-3)",
                options: ["8", "-2", "2", "-8"],
                correctAnswer: "2"
            }
        ]
    },
    {
        title: "Number System - Natural Numbers",
        description: "The basics of counting numbers",
        content: [
            "Natural numbers are the counting numbers we use in everyday life: 1, 2, 3, 4, 5, and so on. They start from 1 and go on indefinitely.",
            "Natural numbers do not include zero, negative numbers, fractions, or decimals. They are the most basic numbers in mathematics.",
            "### Properties of Natural Numbers",
            "Natural numbers have important properties: they can be added and multiplied to get another natural number (closure property).",
            "The order of adding or multiplying natural numbers doesn't change the result (commutative property).",
            "Every natural number has a successor (the next number) and every natural number except 1 has a predecessor (the previous number)."
        ],
        quizQuestions: [
            {
                question: "What is the smallest natural number?",
                options: ["0", "1", "-1", "There is no smallest"],
                correctAnswer: "1"
            },
            {
                question: "Natural numbers include which of the following?",
                options: ["Zero", "Negative numbers", "Fractions", "Positive counting numbers"],
                correctAnswer: "Positive counting numbers"
            },
            {
                question: "Which property states the order of addition doesn't change the result?",
                options: ["Closure Property", "Commutative Property", "Associative Property", "Distributive Property"],
                correctAnswer: "Commutative Property"
            },
            {
                question: "Does every natural number have a predecessor?",
                options: ["Yes", "No, 1 has no natural predecessor", "Yes, except 10", "Only even numbers"],
                correctAnswer: "No, 1 has no natural predecessor"
            }
        ]
    },
    {
        title: "Algebra Basics",
        description: "Introduction to variables and expressions",
        content: [
            "Algebra is a branch of mathematics that uses letters and symbols to represent numbers and quantities in formulas and equations.",
            "Variables are letters that stand for unknown values. For example, in the expression 'x + 5', x is a variable that can represent any number.",
            "### Algebraic Expressions",
            "An algebraic expression is a combination of numbers, variables, and mathematical operations. Examples include '3x + 2' or '5y - 7'.",
            "Like terms are terms that have the same variables raised to the same powers. For example, 2x and 5x are like terms.",
            "To simplify expressions, combine like terms by adding or subtracting their coefficients."
        ],
        quizQuestions: [
            {
                question: "What is a variable in algebra?",
                options: ["A constant number", "A letter representing an unknown value", "An equals sign", "A geometric shape"],
                correctAnswer: "A letter representing an unknown value"
            },
            {
                question: "Which of the following are 'like terms'?",
                options: ["3x and 3y", "2x and 5x", "x and x^2", "4a and 4b"],
                correctAnswer: "2x and 5x"
            },
            {
                question: "Simplify the expression: 2x + 3x",
                options: ["5x", "6x", "5x^2", "x"],
                correctAnswer: "5x"
            },
            {
                question: "In 'y - 4', what is the operation?",
                options: ["Addition", "Multiplication", "Subtraction", "Division"],
                correctAnswer: "Subtraction"
            }
        ]
    },
    {
        title: "Geometry: Triangle",
        description: "Properties and types of triangles",
        content: [
            "A triangle is a polygon with three sides and three angles. The sum of all three angles in any triangle always equals 180 degrees.",
            "### Types of Triangles",
            "Triangles can be classified by their sides: An equilateral triangle has all three sides equal. An isosceles triangle has two equal sides. A scalene triangle has all different sides.",
            "Triangles can also be classified by their angles: An acute triangle has all angles less than 90 degrees. A right triangle has one 90-degree angle. An obtuse triangle has one angle greater than 90 degrees.",
            "The perimeter of a triangle is the sum of all three sides. The area of a triangle is calculated using the formula: Area = (base × height) ÷ 2."
        ],
        quizQuestions: [
            {
                question: "What is the sum of angles in a triangle?",
                options: ["90 degrees", "180 degrees", "360 degrees", "270 degrees"],
                correctAnswer: "180 degrees"
            },
            {
                question: "A triangle with all 3 sides equal is called:",
                options: ["Isosceles", "Scalene", "Equilateral", "Right"],
                correctAnswer: "Equilateral"
            },
            {
                question: "A triangle with one 90-degree angle is:",
                options: ["Acute", "Obtuse", "Right", "Straight"],
                correctAnswer: "Right"
            },
            {
                question: "Formula for area of a triangle is:",
                options: ["base × height", "(base × height) ÷ 2", "side × side", "2 × (length + width)"],
                correctAnswer: "(base × height) ÷ 2"
            }
        ]
    }
];

const seedMathLevels = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // 1. Find Maths Module
        const mathModule = await Module.findOne({ name: "Maths" });
        if (!mathModule) {
            console.error('❌ Maths module not found. Please create modules first.');
            process.exit(1);
        }
        console.log(`FOUND MODULE: Maths (${mathModule._id})`);

        // 2. Create Levels and Save Quizzes
        for (const data of levelsData) {
            console.log(`\nProcessing: ${data.title}...`);

            // Check if level exists
            let level = await Level.findOne({ moduleId: mathModule._id, title: data.title });

            if (level) {
                console.log(`  - Level already exists. Updating content...`);
                level.content = data.content;
                level.hasQuiz = true;
                await level.save();
            } else {
                console.log(`  - Creating new level...`);
                level = new Level({
                    moduleId: mathModule._id,
                    title: data.title,
                    description: data.description,
                    content: data.content,
                    xpReward: 100,
                    hasQuiz: true,
                    isPublished: true
                });
                await level.save();
            }

            // Save Quiz (using hardcoded high-quality questions)
            console.log(`  - Saving Quiz...`);
            await Quiz.findOneAndUpdate(
                { levelId: level._id },
                {
                    levelId: level._id,
                    questions: data.quizQuestions,
                    passingScore: 70
                },
                { upsert: true, new: true }
            );
            console.log(`  - Quiz saved successfully!`);
        }

        console.log('\n✨ Seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedMathLevels();
