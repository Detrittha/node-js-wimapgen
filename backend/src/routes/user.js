const { Router } = require('express');
const router = Router();

const mysqlConnection = require('../database/database');

router.get('/', (req, res) => {
    res.status(200).json('Server on port 4000 and Database is connected.');
});

router.get('/:users', (req, res) => {
    mysqlConnection.query('select * from user', (error, rows, fields) => {
        if(!error) {
            res.json(rows);
        } else {
            console.log(error);
        }
    });
});

//This function allows us concatenate 'id' to url => localhost:4000/id
router.get('/:users/:id', (req, res) => {
    const { id } = req.params;
    mysqlConnection.query('select * from user where id = ?', [id], (error, rows, fields) => {
        if(!error) {
            res.json(rows);
        } else {
            console.log(error);
        }
    })
});

const bcrypt = require('bcrypt');

router.post('/:users', async (req, res) => {
    const { Email, password, username, fullName } = req.body;
    const defaultStatus = 2; // กำหนดค่า default ของ status
    
    try {
        // แฮชรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed password:', hashedPassword);

        // เพิ่มข้อมูลผู้ใช้
        mysqlConnection.query(
            'INSERT INTO user(email, password, username, fullName, status) VALUES (?, ?, ?, ?, ?)',
            [Email, hashedPassword, username, fullName, defaultStatus],
            (error, rows, fields) => {
                if (!error) {
                    res.json({ Status: "User saved" });
                } else {
                    console.log(error);
                    res.status(500).json({ error: "Failed to save user" });
                }
            }
        );
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});





router.put('/:users/:id', (req, res) => {
    const { id } = req.params;
    const { Email, password, username, fullName} = req.body;
    const defaultStatus = 2; // กำหนดค่า default ของ status
    mysqlConnection.query(
        'UPDATE user SET username = ?, fullName = ?, mail = ?, password = ?, status = ? WHERE iduser = ?',
        [username, fullName, Email, password, defaultStatus, id],
        (error, rows, fields) => {
            if (!error) {
                res.json({ Status: 'User updated' });
            } else {
                console.log(error);
                res.status(500).json({ error: 'Failed to update user' });
            }
        }
    );
});




router.delete('/:users/:id', (req,res) => {
    const { id } = req.params;
    mysqlConnection.query('delete from user where id = ?', [id], (error, rows, fields) => {
        if(!error){
            res.json({
                Status: "User deleted"
            });
        } else {
            res.json({
                Status: error
            });
        }
    })
});

router.delete('/users', (req, res) => {
    mysqlConnection.query('DELETE FROM user', (error, rows, fields) => {
        if (!error) {
            res.json({ Status: "All users deleted" });
        } else {
            res.status(500).json({ error: "Failed to delete users" });
        }
    });
});


module.exports = router;


