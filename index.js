import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';

const app = express();

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4() + path.extname(file.originalname);
    cb(null, file.fieldname + "_" + uniqueSuffix);
  }
});
const upload = multer({ storage: storage });

// CORS
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static HLS files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Video Streaming service' });
});

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  const lessonId = uuidv4();
  const videoPath = path.resolve(req.file.path); // safer
  const outputPath = path.join(process.cwd(), "uploads", lessonId);
  const hlsPath = path.join(outputPath, "index.m3u8");

  console.log(`hlsPath: ${hlsPath}`);

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const ffmpegCommand = `ffmpeg -i "${videoPath}" -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename "${outputPath}/segment%03d.ts" -start_number 0 "${hlsPath}"`;

  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).json({ error: 'Failed to process video' });
    }

    console.log(`stderr (ffmpeg): ${stderr}`);
    console.log(`stdout: ${stdout}`);

    const videoUrl = `http://localhost:8000/uploads/${lessonId}/index.m3u8`;
    res.json({
      message: 'Video converted to HLS format successfully',
      lessonId,
      videoUrl,
      hlsPath
    });
  });
});

app.listen(8000, () => {
  console.log('App is running on port 8000');
});
