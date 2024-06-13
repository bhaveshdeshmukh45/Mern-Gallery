const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

require("dotenv").config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Ensure uploads directory exists
const dir = './uploads';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Image Schema
const imageSchema = new mongoose.Schema({
    url: String,
    userId: String,
    createdAt: { type: Date, default: Date.now }
});

const Image = mongoose.model('Image', imageSchema);

// Routes
app.post('/upload/:userId', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const newImage = new Image({ url: `/uploads/${req.file.filename}`, userId: req.params.userId });
    newImage.save()
        .then(image => res.json(image))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Failed to save image' });
        });
});

app.get('/images/:userId', (req, res) => {
    Image.find({ userId: req.params.userId })
        .then(images => res.json(images))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch images' });
        });
});

app.delete('/images/:userId/:id', (req, res) => {
    Image.findOneAndDelete({ _id: req.params.id, userId: req.params.userId })
        .then(deletedImage => {
            if (!deletedImage) {
                return res.status(404).json({ error: 'Image not found or not authorized' });
            }

            fs.unlink(`.${deletedImage.url}`, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to delete image file' });
                }
                res.json({ success: true });
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Failed to delete image' });
        });
});

 


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));