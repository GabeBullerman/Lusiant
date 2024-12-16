//Author: Gabriel Bullerman
//gbulle@iastate.edu
//Date :  April 27, 2024

const fs = require('fs').promises;
const express = require("express");
const db = require("./db.js");
const cors = require("cors");

const app = express();

const PORT = 5000; // Set to a valid HTTP port
app.use(cors());
app.use(express.json());


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Route to get all products
app.get("/catalog", async (req, res) => {
    try {
        const query = "SELECT * FROM final_project.products";
        const [result] = await db.query(query);
        console.log("Success in Reading MySQL");
        res.status(200).send(result);
    } catch (err) {
        console.error("Error in Reading MySQL :", err);
        res.status(500).send({ error: 'An error occurred while fetching items.' });
    }
});

// Route to get products by category
app.get("/catalog/category/:category", async (req, res) => {
    try {
        const category = req.params.category;
        const query = "SELECT * FROM final_project.products WHERE category = ?";
        const [result] = await db.query(query, [category]);
        console.log("Success in Reading MySQL");
        res.status(200).send(result);
    } catch (err) {
        console.error("Error in Reading MySQL :", err);
        res.status(500).send({ error: 'An error occurred while fetching items by category.' });
    }
});

// Route to get a single product by ID
app.get("/catalog/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const query = "SELECT * FROM final_project.products WHERE id = ?";
        const [result] = await db.query(query, [id]);
        console.log("Success in Reading MySQL");
        res.status(200).send(result);
    } catch (err) {
        console.error("Error in Reading MySQL :", err);
        res.status(500).send({ error: 'An error occurred while fetching the item.' });
    }
});

// Route to create a new product
app.post("/catalog", async (req, res) => {
    try {
        const { id, category, description, price, imagePath, rating } = req.body;
        const query = "INSERT INTO final_project.products (id, category, description, price, imagePath, rating) VALUES (?, ?, ?, ?, ?, ?)";
        await db.query(query, [id, category, description, price, imagePath, rating]);
        console.log("Success in Writing to MySQL");
        res.status(201).send({ message: 'Product created successfully.' });
    } catch (err) {
        console.error("Error in Writing to MySQL :", err);
        res.status(500).send({ error: 'An error occurred while creating the product.', details: err.message });
    }
});

// Route to read a list of items
app.get("/catalog", async (req, res) => {
    try {
        const query = "SELECT * FROM final_project.products";
        const [result] = await db.query(query);
        console.log("Success in Reading MySQL");
        res.status(200).send(result);
    } catch (err) {
        console.error("Error in Reading MySQL :", err);
        res.status(500).send({ error: 'An error occurred while fetching items.' });
    }
});

// Route to read a single item by ID
app.get("/catalog/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const query = "SELECT * FROM final_project.products WHERE id = ?";
        const [result] = await db.query(query, [id]);
        console.log("Success in Reading MySQL");
        res.status(200).send(result);
    } catch (err) {
        console.error("Error in Reading MySQL :", err);
        res.status(500).send({ error: 'An error occurred while fetching the item.' });
    }
});

// Route to update an existing item by ID
app.put("/catalog/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updatedProduct = req.body; // Assuming the request body contains the updated product data
        const query = "UPDATE final_project.products SET ? WHERE id = ?";
        const [result] = await db.query(query, [updatedProduct, id]);
        console.log("Success in Updating MySQL");
        res.status(200).send({ message: 'Product updated successfully' });
    } catch (err) {
        console.error("Error in Updating MySQL :", err);
        res.status(500).send({ error: 'An error occurred while updating the product.' });
    }
});

// Route to delete an existing item by ID
app.delete("/catalog/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const query = "DELETE FROM final_project.products WHERE id = ?";
        const [result] = await db.query(query, [id]);
        console.log("Success in Deleting MySQL");
        res.status(204).send();
    } catch (err) {
        console.error("Error in Deleting MySQL :", err);
        res.status(500).send({ error: 'An error occurred while deleting the product.' });
    }
});

app.get('/images/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const query = 'SELECT image FROM final_project.products WHERE id = ?';
        const [result] = await db.query(query, [id]);
        console.log("Success in Reading MySQL");
        res.status(200).send({ URL: result[0].image });
    } catch (err) {
        console.error("Error in Reading MySQL :", err);
        res.status(500).send('An error occurred while fetching the image URL.');
    }
});

