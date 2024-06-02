const database = require('../services/database')

exports.getAllEmployees = async (req, res) => {
    try {
      // const result = await database.pool.query(`SELECT e.emp_id, e.emp_name, e.job_title, e.email,

      //                                           (SELECT ROW_TO_JSON(departments_obj) 
      //                                           FROM (SELECT dep_id, dep_name FROM test.departments1 WHERE dep_id = e.dep_id)
      //                                                     departments_obj) as departments
                                              
      //                                          FROM test.employees1 e`);

      const result = await database.pool.query("SELECT * FROM test.employees1"); 
      return res.status(200).json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

exports.createEmployee = async (req, res) => {
  try {

    if(!req.body.emp_name) {
      return res.status(422).json({ error: 'Employee Name is required' });
    }

    if(!req.body.job_title) {
      return res.status(422).json({ error: 'Job Title is required' });
    }

    if(!req.body.email) {
      return res.status(422).json({ error: 'Email is required' });
    }

    if(!req.body.dep_id) {
      return res.status(422).json({ error: 'Department ID is required' });
    } else {
      const existResults = await database.pool.query({
        text: "SELECT EXISTS (SELECT * FROM test.departments1 WHERE dep_id = $1)",
        values: [req.body.dep_id]
    })
        if(!existResults.rows[0].exists) {
            return res.status(422).json({ error: `Department ID not found` });
        }
    }

    const result = await database.pool.query({
      text: `INSERT INTO test.employees1 (emp_name, job_title, email, dep_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
      values: [
        req.body.emp_name,
        req.body.job_title,
        req.body.email,
        req.body.dep_id
      ]
    })

    return res.status(201).json(result.rows[0])

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

exports.updateEmployee = async (req, res) => {
  try {
    if(!req.body.emp_name || !req.body.job_title || !req.body.email || !req.body.dep_id) {
      return res.status(422).json({ error: 'All fields are required' });
    }

   const existResults = await database.pool.query({
      text: "SELECT EXISTS (SELECT * FROM test.departments1 WHERE dep_id = $1)",
      values: [req.body.dep_id]
    })
      if(!existResults.rows[0].exists) {
          return res.status(422).json({ error: `Department ID not found` });
      }

    const result = await database.pool.query({
      text: `UPDATE test.employees1
              SET emp_name = $1, job_title =$2, email = $3, dep_id = $4
              WHERE emp_id = $5
              RETURNING *`,
      values: [
        req.body.emp_name,
        req.body.job_title,
        req.body.email,
        req.body.dep_id,
        req.params.id
      ]
  })

  if(result.rowCount == 0) {
      return res.status(404).json({ error: "Employee Not Found" });
  }

  return res.status(200).json(result.rows[0]);
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

exports.deleteEmployee = async (req, res) => {
  try {
    const result = await database.pool.query({
      text: `DELETE FROM test.employees1 WHERE emp_id = $1`,
      values: [req.params.id]
  })

  if(result.rowCount == 0) {
      return res.status(404).json({ error: "Employee Not Found" });
  }

  return res.status(204).json({ success : "Employee has been deleted"});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

exports.getEmployeeByID = async (req, res) => {
  try {
    const result = await database.pool.query({
      // text: ` SELECT e.emp_id, e.emp_name, e.job_title, e.email,

      //           (SELECT ROW_TO_JSON(departments_obj) 
      //           FROM (SELECT dep_id, dep_name FROM test.departments1 WHERE dep_id = e.dep_id)
      //                     departments_obj) as departments
              
      //         FROM test.employees1 e
      //         WHERE e.emp_id = $1
      //       `,
      text: `SELECT * FROM test.employees1
              WHERE emp_id = $1
              `,
      values: [req.params.id]
    })

    if(result.rowCount == 0) {
      return res.status(404).json({ error: "Employee Not Found" });
    }

    return res.status(200).json(result.rows[0]);
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

exports.upsertMultipleEmployees = async (req, res) => {
  try {
    await database.pool.query('BEGIN')
    const employees = req.body;
    
    const text = `INSERT INTO test.employees1 (emp_id, emp_name, job_title, email, dep_id)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (emp_id)
                    DO UPDATE SET
                    emp_name = EXCLUDED.emp_name,
                    job_title = EXCLUDED.job_title,
                    email = EXCLUDED.email,
                    dep_id = EXCLUDED.dep_id
                    RETURNING *`;
   for(const emp of employees) {
    values = [emp.emp_id, emp.emp_name, emp.job_title, emp.email, emp.dep_id];
    await database.pool.query(text, values)
   }
            
     await database.pool.query('COMMIT')
    res.status(200).send("Data upserted successfully");
  } 
 catch (error) {
    return res.status(500).json({ error: error.message });
  }
}