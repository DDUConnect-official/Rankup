import React, { useState } from "react";

const TheoryEditor = ({ theory, setTheory }) => {
    const addBlock = (type) => {
        setTheory([...theory, { type, content: "" }]);
    };

    const updateBlock = (index, content) => {
        const newTheory = [...theory];
        newTheory[index].content = content;
        setTheory(newTheory);
    };

    const removeBlock = (index) => {
        const newTheory = theory.filter((_, i) => i !== index);
        setTheory(newTheory);
    };

    return (
        <div className="border p-4 rounded bg-gray-50 mb-6">
            <h3 className="font-bold mb-4">Theory Content</h3>
            {theory.map((block, index) => (
                <div key={index} className="mb-4 flex gap-2">
                    <textarea
                        className="w-full p-2 border rounded"
                        placeholder={`Enter ${block.type}...`}
                        value={block.content}
                        onChange={(e) => updateBlock(index, e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={() => removeBlock(index)}
                        className="text-red-500 font-bold px-2"
                    >
                        X
                    </button>
                </div>
            ))}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => addBlock("paragraph")}
                    className="bg-blue-200 text-blue-800 px-3 py-1 rounded text-sm"
                >
                    + Paragraph
                </button>
                <button
                    type="button"
                    onClick={() => addBlock("bullet")}
                    className="bg-green-200 text-green-800 px-3 py-1 rounded text-sm"
                >
                    + Bullet Point
                </button>
            </div>
        </div>
    );
};

export default TheoryEditor;
