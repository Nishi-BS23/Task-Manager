import React, { useState } from 'react';

interface Item {
    id: number;
    text: string;
}
const TaskSBU = () => {
    const [input, setInput] = useState("");
    const [items, setItems] = useState<Item[]>([]);
    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const newItem: Item = {
            id: Date.now(),
            text: input.trim(),
        }
        setItems((prev) => [...prev, newItem]);
        setInput("");
    }
    const handleDelete = (id: number) => {
        setItems((prev) => prev.filter((item) => item.id != id));
    }
    return (
        <div>
            <h2>Test</h2>
            <form onSubmit={handleAdd}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="border rounded"
                />
                <button
                    type="submit">
                    Submit
                </button>
            </form>
            <ul>
                {
                    items.map((item) => (
                        <li
                            key={item.id}>
                            <h1>{item.text}  <span onClick={() => handleDelete(item.id)}>x</span></h1>
                            {/* <button
                                onClick={() => handleDelete(item.id)}
                            >
                                x
                            </button> */}
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}

export default TaskSBU
