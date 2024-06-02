const database = require('../services/database');

exports.getAttributes = async (req, res) => {
    try {
      const result = await database.pool.query("SELECT * FROM test.attributes1");
      return res.status(200).json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

exports.createAttribute = async (req, res) => {
try {
    // if(!req.body.emp_id || !req.body.positions || !req.body.widget_state) {
    //     return res.status(422).json({ error: 'All fields are required' });
    // }

    // const existResults = await database.pool.query({
    //     text: "SELECT EXISTS (SELECT * FROM test.attributes1 WHERE emp_id = $1)",
    //     values: [req.body.emp_id]
    // })

    // if(existResults.rows[0].exists) {
    //     return res.status(408).json({ error: `Attribute already exists` });
    // }

    const result = await database.pool.query({
        text: `INSERT INTO test.attributes1 (emp_id, positions, widget_state) 
                VALUES ($1, $2, $3) 
                RETURNING *`,
        values: [req.body.emp_id, req.body.positions, req.body.widget_state]
    });

    return res.status(201).json(result.rows[0]);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.deleteAttribute = async (req, res) => {
    try {
        // const countResult = await database.pool.query({
        //     text: `SELECT COUNT(*) FROM test.employees1 WHERE dep_id = $1`,
        //     values: [req.params.id]
        // })

        // if(countResult.rows[0].count > 0){
        //     return res.status(409).json({ error: `${countResult.rows[0].count} employee(s) in this department , so it can not be deleted` });
        // }

        const result = await database.pool.query({
            text: `DELETE FROM test.attributes1 WHERE emp_id = $1`,
            values: [req.params.id]
        })

        if(result.rowCount == 0) {
            return res.status(404).json({ error: "Attribute Not Found" });
        }

        return res.status(204).json({ message : "Department has been deleted"});
        
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.upsertMultipleAttributes = async (req, res) => {
    try {
        await database.pool.query('BEGIN')
        const attributes = req.body;
        
        const text = `INSERT INTO test.attributes1 (emp_id, positions, widget_state)
                        VALUES ($1, $2, $3)
                        ON CONFLICT (emp_id)
                        DO UPDATE SET
                        positions = EXCLUDED.positions,
                        widget_state = EXCLUDED.widget_state
                        RETURNING *`;
       for(const att of attributes) {
        values = [att.emp_id, att.positions, att.widget_state];
        await database.pool.query(text, values)
       }
                
         await database.pool.query('COMMIT')
        res.status(200).send("Data upserted successfully");
    } 
    
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}