const database = require('../services/database');

exports.getAllMessagess = async (req, res) => {
    try {
      const result = await database.pool.query("SELECT * FROM test.messages1");
      return res.status(200).json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  exports.createMessage = async (req, res) => {
    try {
        const result = await database.pool.query({
            text: 'INSERT INTO test.messages1 (sender, recipients, subject, body, date, status, id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            values: [req.body.sender, req.body.recipients, req.body.subject, req.body.body, req.body.date, req.body.status, req.body.id]
        });

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.deleteMessage = async (req, res) => {
    try {
        const result = await database.pool.query({
            text: `DELETE FROM test.messages1 WHERE id = $1`,
            values: [req.params.id]
        })

        if(result.rowCount == 0) {
            return res.status(404).json({ error: "Message Not Found" });
        }

        return res.status(204).json({ message : "Message has been deleted"});
        
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.getMessageById = async (req, res) => {
    try {
        const result = await database.pool.query({
            text: `SELECT * FROM test.messages1
                   WHERE id = $1`,
            values:[req.params.id]
        })

        if(result.rowCount == 0) {
            return res.status(404).json({ error: "Department Not Found" });
        }

        return res.status(200).json(result.rows[0]);
        
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.updateMessage = async (req, res) => {
    try {
    //   if(!req.body.sender || !req.body.recipients || !req.body.subject || !req.body.body) {
    //     return res.status(422).json({ error: 'All fields are required' });
    //   }
  
     const existResults = await database.pool.query({
        text: "SELECT EXISTS (SELECT * FROM test.messages1 WHERE id = $1)",
        values: [req.body.id]
      })
        if(!existResults.rows[0].exists) {
            return res.status(422).json({ error: `Message not found` });
        }
  
      const result = await database.pool.query({
        text: `UPDATE test.messages1
                SET sender = $1, recipients =$2, subject = $3, body = $4, date = $5, status = $6
                WHERE id = $7
                RETURNING *`,
        values: [
          req.body.sender,
          req.body.recipients,
          req.body.subject,
          req.body.body,
          req.body.date,
          req.body.status,
          req.params.id
        ]
    })
  
    if(result.rowCount == 0) {
        return res.status(404).json({ error: "Message Not Found" });
    }
  
    return res.status(200).json(result.rows[0]);
      
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  