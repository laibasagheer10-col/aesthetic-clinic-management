const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Service = require('../models/Service');
const Blog = require('../models/content/Blog');
const Gallery = require('../models/content/Gallery');
const BeforeAfterImage = require('../models/patient/BeforeAfterImage');

// 🔍 Diagnostic endpoint - Check all images
router.get('/images', async (req, res) => {
  try {
    const services = await Service.find().select('name image -__v');
    const blogs = await Blog.find().select('title image -__v');
    const gallery = await Gallery.find().select('title image -__v');
    const beforeAfter = await BeforeAfterImage.find().select('patientName beforeImage afterImage -__v');

    const report = {
      services: {
        total: services.length,
        withImages: services.filter(s => s.image && s.image !== '/default-service.jpg').length,
        items: services.map(s => ({
          name: s.name,
          image: s.image,
          hasImage: !!(s.image && s.image !== '/default-service.jpg')
        }))
      },
      blogs: {
        total: blogs.length,
        withImages: blogs.filter(b => b.image && b.image !== '/default-blog.jpg').length,
        items: blogs.map(b => ({
          title: b.title,
          image: b.image,
          hasImage: !!(b.image && b.image !== '/default-blog.jpg')
        }))
      },
      gallery: {
        total: gallery.length,
        withImages: gallery.filter(g => g.image).length,
        items: gallery.map(g => ({
          title: g.title,
          image: g.image,
          hasImage: !!g.image
        }))
      },
      beforeAfter: {
        total: beforeAfter.length,
        withImages: beforeAfter.filter(ba => ba.beforeImage && ba.afterImage).length,
        items: beforeAfter.map(ba => ({
          patient: ba.patientName,
          beforeImage: ba.beforeImage,
          afterImage: ba.afterImage,
          hasImages: !!(ba.beforeImage && ba.afterImage)
        }))
      }
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔨 Test endpoint - Create sample service with image
router.post('/test/create-sample', async (req, res) => {
  try {
    const sampleService = await Service.create({
      name: 'Test Service',
      description: 'This is a test service to verify image functionality',
      shortDescription: 'Test Service',
      price: 5000,
      duration: '30 mins',
      icon: '✨',
      image: '/uploads/services/test-image.jpg',
      category: 'Facial',
      isActive: true
    });

    const sampleBlog = await Blog.create({
      title: 'Test Blog Post',
      content: 'This is a test blog to verify image functionality',
      excerpt: 'Test Blog',
      author: 'Admin',
      image: '/uploads/blogs/test-blog.jpg',
      isPublished: true
    });

    res.json({
      message: 'Sample data created successfully',
      service: sampleService,
      blog: sampleBlog,
      note: 'Please upload actual images to the paths: /uploads/services/test-image.jpg and /uploads/blogs/test-blog.jpg'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔍 Check file existence - Verify uploaded files actually exist
router.get('/files/check', async (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../public/uploads');
    
    const fileStatus = {
      uploadsDir: uploadsDir,
      uploadsExists: fs.existsSync(uploadsDir),
      blogs: {
        dir: path.join(uploadsDir, 'blogs'),
        exists: fs.existsSync(path.join(uploadsDir, 'blogs')),
        files: []
      },
      services: {
        dir: path.join(uploadsDir, 'services'),
        exists: fs.existsSync(path.join(uploadsDir, 'services')),
        files: []
      },
      gallery: {
        dir: path.join(uploadsDir, 'gallery'),
        exists: fs.existsSync(path.join(uploadsDir, 'gallery')),
        files: []
      }
    };

    // List files in each directory
    const folders = ['blogs', 'services', 'gallery'];
    for (const folder of folders) {
      const folderPath = path.join(uploadsDir, folder);
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        fileStatus[folder].files = files.slice(0, 10); // Show first 10 files
        fileStatus[folder].fileCount = files.length;
      }
    }

    console.log("📁 File Status:", fileStatus);
    res.json(fileStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔍 Check specific image
router.get('/files/check/:type/:filename', async (req, res) => {
  try {
    const { type, filename } = req.params;
    const filePath = path.join(__dirname, '../public/uploads', type, filename);
    
    const status = {
      type,
      filename,
      requestedPath: filePath,
      exists: fs.existsSync(filePath),
      size: fs.existsSync(filePath) ? fs.statSync(filePath).size : null,
      absoluteUrl: `http://localhost:5000/uploads/${type}/${filename}`
    };

    console.log("🔎 Checking file:", status);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
