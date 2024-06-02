const database = require('../services/database')

exports.getAllDepartments = async (req, res) => {
    try {
      const result = await database.pool.query("SELECT * FROM test.departments1");
      return res.status(200).json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

exports.createDepartment = async (req, res) => {
    try {
        if(!req.body.dep_name) {
            return res.status(422).json({ error: 'Department Name is required' });
        }

        const existResults = await database.pool.query({
            text: "SELECT EXISTS (SELECT * FROM test.departments1 WHERE dep_name = $1)",
            values: [req.body.dep_name]
        })

        if(existResults.rows[0].exists) {
            return res.status(408).json({ error: `Department Name ${req.body.dep_name} already exists` });
        }

        const result = await database.pool.query({
            text: 'INSERT INTO test.departments1 (dep_name) VALUES ($1) RETURNING *',
            values: [req.body.dep_name]
        });

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.updateDepartment = async (req, res) => {
    try {
        if(!req.body.dep_name) {
            return res.status(422).json({ error: 'Department Name is required' });
        } else {
            const existResults = await database.pool.query({
                text: "SELECT EXISTS (SELECT * FROM test.departments1 WHERE dep_name = $1)",
                values: [req.body.dep_name]
            })
    
            if(existResults.rows[0].exists) {
                return res.status(408).json({ error: `Department Name ${req.body.dep_name} already exists` });
            }
        }

        const result = await database.pool.query({
            text: `UPDATE test.departments1
                    SET dep_name = $1
                    WHERE dep_id = $2
                    RETURNING *`,
            values: [
                req.body.dep_name,
                req.params.id
            ]
        })

        if(result.rowCount == 0) {
            return res.status(404).json({ error: "Department Not Found" });
        }

        return res.status(200).json(result.rows[0]);
        
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.deleteDepartment = async (req, res) => {
    try {
        const countResult = await database.pool.query({
            text: `SELECT COUNT(*) FROM test.employees1 WHERE dep_id = $1`,
            values: [req.params.id]
        })

        if(countResult.rows[0].count > 0){
            return res.status(409).json({ error: `${countResult.rows[0].count} employee(s) in this department , so it can not be deleted` });
        }

        const result = await database.pool.query({
            text: `DELETE FROM test.departments1 WHERE dep_id = $1`,
            values: [req.params.id]
        })

        if(result.rowCount == 0) {
            return res.status(404).json({ error: "Department Not Found" });
        }

        return res.status(204).json({ success : "Department has been deleted"});
        
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

exports.getDepartmentById = async (req, res) => {
    try {
        const result = await database.pool.query({
            text: `SELECT * FROM test.departments1
                   WHERE dep_id = $1`,
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

exports.upsertMultipleDepartments = async (req, res) => {
    try {
        await database.pool.query('BEGIN')
        const departments = req.body;
        
        const text = `INSERT INTO test.departments1 (dep_id, dep_name)
                        VALUES ($1, $2)
                        ON CONFLICT (dep_id)
                        DO UPDATE SET
                            dep_name = EXCLUDED.dep_name
                        RETURNING *`;
       for(const dep of departments) {
        values = [dep.dep_id, dep.dep_name];
        await database.pool.query(text, values)
       }
                
         await database.pool.query('COMMIT')
        res.status(200).send("Data upserted successfully");
    } 
    
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}