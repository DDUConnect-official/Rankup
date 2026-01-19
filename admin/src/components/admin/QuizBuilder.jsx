import React, { useState } from "react";

const QuizBuilder = ({ quiz, setQuiz }) => {

    const addQuestion = () => {
        setQuiz({
            ...quiz,
            questions: [
                ...quiz.questions,
                { question: "", options: ["", "", "", ""], correctAnswer: "" }
            ]
        });
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...quiz.questions];
        newQuestions[index][field] = value;
        setQuiz({ ...quiz, questions: newQuestions });
    };

    const updateOption = (qIndex, oIndex, value) => {
        const newQuestions = [...quiz.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuiz({ ...quiz, questions: newQuestions });
    };

    return (
        <div className="border p-4 rounded bg-green-50 mb-6">
            <h3 className="font-bold mb-4">Quiz Builder</h3>
            <div className="mb-4">
                <label className="block text-sm font-bold">Passing Score</label>
                <input
                    type="number"
                    value={quiz.passingScore}
                    onChange={(e) => setQuiz({ ...quiz, passingScore: Number(e.target.value) })}
                    className="border p-1 rounded"
                />
            </div>

            {quiz.questions.map((q, qIndex) => (
                <div key={qIndex} className="mb-6 border-b pb-4">
                    <input
                        type="text"
                        placeholder="Question?"
                        className="w-full p-2 border rounded mb-2 font-bold"
                        value={q.question}
                        onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, oIndex) => (
                            <input
                                key={oIndex}
                                type="text"
                                placeholder={`Option ${oIndex + 1}`}
                                className="w-full p-2 border rounded text-sm"
                                value={opt}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            />
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="Correct Answer (must match option exactly)"
                        className="w-full p-2 border rounded mt-2 bg-yellow-50"
                        value={q.correctAnswer}
                        onChange={(e) => updateQuestion(qIndex, "correctAnswer", e.target.value)}
                    />
                </div>
            ))}
            <button
                type="button"
                onClick={addQuestion}
                className="bg-green-600 text-white px-4 py-2 rounded"
            >
                + Add Question
            </button>
        </div>
    );
};

export default QuizBuilder;
