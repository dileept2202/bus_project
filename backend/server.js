const express = require('express');
const session = require('express-session');
const multer = require('multer');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql2');
const app = express();

// Middleware
app.use(express.json());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: '24de',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Admin@123',
    database: 'bus'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Multer storage for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Login endpoint
app.post('/login', (req, res) => {
    const { bus_id, bus_regnum } = req.body;

    const query = 'SELECT * FROM bus_info WHERE bus_id = ? AND bus_no = ?';
    connection.query(query, [bus_id, bus_regnum], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (results.length > 0) {
            req.session.user = { bus_id: results[0].bus_id, bus_no: results[0].bus_no };
            res.status(200).json({ message: 'Login successful', user: results[0], status: 'exist' });
        } else {
            res.status(401).json({ message: 'Incorrect bus ID or bus registration number', status: 'notexist' });
        }
    });
});

// Fetch bus details
app.get('/bus/:id', (req, res) => {
    const bus_id = req.params.id;
    console.log(bus_id);
    connection.query('SELECT * FROM bus_info WHERE bus_id = ?', [bus_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Function to generate a unique 6-digit code
const generateUniqueCode = async () => {
    let codeid;
    let exists = true;

    while (exists) {
        // Generate a random 6-digit number
        codeid = Math.floor(100000 + Math.random() * 900000);

        // Check if the codeid already exists in the database
        const [rows] = await connection.promise().query('SELECT COUNT(*) as count FROM service_records WHERE codeid = ?', [codeid]);
        exists = rows[0].count > 0;
    }
    return codeid;
};

app.post('/service-record', upload.single('bill'), async (req, res) => {
    console.log('Request Body:', req.body);

    const { applicant_name, service_date, last_date, services_done, queries, bus_id, bus_no } = req.body;
    const bill = req.file ? req.file.filename : null;

    // Validate incoming data
    if (!applicant_name || !service_date || !last_date || !bus_id || !bus_no) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const codeid = await generateUniqueCode(); // Generate unique 6-digit code

        const query = `
            INSERT INTO service_records (codeid, bus_id, bus_no, name, service_date, last_date, services_done, bill, queries) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const values = [codeid, bus_id, bus_no, applicant_name, service_date, last_date, services_done ? services_done.join(', ') : '', bill, queries];

        connection.query(query, values, (err) => {
            if (err) {
                console.error('Database Error:', err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Service record submitted successfully!', codeid });
        });
    } catch (error) {
        console.error('Error generating unique ID:', error.message);
        res.status(500).json({ error: 'Error generating unique ID' });
    }
});
// Fetch service record by codeid
app.get('/service-record/:codeid', (req, res) => {
    const { codeid } = req.params;
    console.log("Received codeid:", codeid); // Log received codeid
  
    const query = 'SELECT * FROM service_records WHERE codeid = ?';
    connection.query(query, [codeid], (err, results) => {
        if (err) {
            console.error('Database Error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            console.log('No records found for codeid:', codeid); // Log if no records found
            return res.status(404).json({ error: 'Service record not found' });
        }
        console.log("Database results:", results); // Check the value of data before accessing it
        const record = results[0];

        // Convert the BLOB to base64 for the bill if it exists
        if (record.bill) {
            console.log("Raw bill Buffer data:", record.bill); // Log raw buffer
            const billBase64 = record.bill.toString('base64'); // Convert Buffer to base64 string
            record.bill = `data:image/jpeg;base64,${billBase64}`; // Adjust the MIME type as needed
        } else {
            record.bill = null; // Ensure bill is null if not present
        }
        
  
        res.json(record); // Return the modified record
    });
});


  


// Start server
app.listen(5000, () => {
    console.log('Server running on port 5000');
});
