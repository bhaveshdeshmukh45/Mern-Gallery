import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [userId, setUserId] = useState('');
    const [images, setImages] = useState([]);
    const [file, setFile] = useState(null);

    useEffect(() => {
        if (userId.trim() !== '') {
            axios.get(`http://localhost:5000/images/${userId}`)
                .then(res => setImages(res.data))
                .catch(err => console.error(err));
        }
    }, [userId]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = () => {
        if (userId.trim() === '') {
            alert('Please enter a user ID');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        axios.post(`http://localhost:5000/upload/${userId}`, formData)
            .then(res => setImages([...images, res.data]))
            .catch(err => {
                console.error('Upload error:', err);
                alert('Failed to upload image');
            });
    };

    const handleDelete = (id) => {
        axios.delete(`http://localhost:5000/images/${userId}/${id}`)
            .then(() => setImages(images.filter(image => image._id !== id)))
            .catch(err => {
                console.error('Delete error:', err);
                alert('Failed to delete image');
            });
    };

    const handleUserIdChange = (e) => {
        setUserId(e.target.value);
    };

    return (
        <div className="App">
            <header className="header">
                <h1>Gallery App</h1>
            </header>
            <div className="input-container">
                <input 
                    type="text" 
                    placeholder="Enter User ID" 
                    value={userId} 
                    onChange={handleUserIdChange} 
                    className="user-input"
                />
                <input 
                    type="file" 
                    onChange={handleFileChange} 
                    className="file-input"
                />
                <button onClick={handleUpload} className="upload-button">Upload</button>
            </div>
            <div className="gallery">
                {images.map((image) => (
                    <div key={image._id} className="image-container">
                        <img src={`http://localhost:5000${image.url}`} alt="Uploaded" className="image" />
                        <button onClick={() => handleDelete(image._id)} className="delete-button">Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;