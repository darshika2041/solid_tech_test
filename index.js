const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser"); 

const app = express();
const port = 3000;

app.use(bodyParser.json());

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "test_demo",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

app.get("/api/users", (req, res) => {
  const getUsersQuery = "SELECT * FROM user";

  connection.query(getUsersQuery, (err, results) => {
    if (err) {
      console.error("Error executing MySQL query:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }
    res.json(results);
  });
});


app.post("/api/users/createuser", (req, res) => {
    
    const email = req.body.email;
    
    connection.query("SELECT COUNT(*) AS count FROM user WHERE email = ?", [email], (err, results) => {
      if (err) {
        console.error("Error executing MySQL query:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
  
      const emailExists = results[0].count > 0;
      
      if (emailExists) {
        return res.status(400).json({ error: "Email already exists" });
      }
  
      const createUserQuery = "INSERT INTO user (name, email, password) VALUES (?, ?, ?)";
      
      connection.query(createUserQuery, [req.body.name, email, req.body.password], (err, result) => {
        if (err) {
          console.error("Error executing MySQL query:", err);
          return res.status(500).json({ error: "Internal server error" });
        }
        res.json({ id: result.insertId });
      });
    });
  });
  

app.put("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    const getUserQuery = "SELECT * FROM user WHERE id = ?";
    const updateUserQuery = "UPDATE user SET name = ?, email = ? WHERE id = ?";
    
    connection.query(getUserQuery, [id], (err, results) => {
      if (err) {
        console.error("Error executing MySQL query:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
  
      if (results.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }
  
      connection.query(updateUserQuery, [name, email, id], (err, result) => {
        if (err) {
          console.error("Error executing MySQL query:", err);
          res.status(500).json({ error: "Internal server error" });
          return;
        }
        res.json({ message: "User updated successfully" });
      });
    });
  });
  


app.delete("/api/users/:id", (req, res) => {
    const { id } = req.params;
    const getUserQuery = "SELECT * FROM user WHERE id = ?";
    const deleteUserQuery = "DELETE FROM user WHERE id = ?";
  
    connection.query(getUserQuery, [id], (err, results) => {
      if (err) {
        console.error("Error executing MySQL query:", err);
        res.status(500).json({ error: "Internal server error" });
        return;
      }
  
      if (results.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
      }
  
      connection.query(deleteUserQuery, [id], (err, result) => {
        if (err) {
          console.error("Error executing MySQL query:", err);
          res.status(500).json({ error: "Internal server error" });
          return;
        }
  
        res.json({ message: "User deleted successfully" });
      });
    });
  });
  

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
