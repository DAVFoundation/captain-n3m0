const mysql = require('mysql');

const host = process.env.MYSQL_HOST;
const user = process.env.MYSQL_USER;
const password = process.env.MYSQL_PASSWORD;
const database = process.env.MYSQL_DB;

const createConnection = (multipleStatements = false) => {
  return mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database,
    timezone: 'utc',
    multipleStatements: multipleStatements
  });
}

const createNeed = async () => {
  return new Promise((resolve, reject) => {
    const connection = createConnection(true);
    connection.query(
      `INSERT INTO missions (need_created_at) VALUES (NOW())`,
      function(error, results, fields) {
        if (error) {
          reject(error);
        } else {
          resolve(
            results.insertId
          );
        }
        connection.destroy();
      }
    );
  });
}

const getMission = async(id) => {
  return new Promise((resolve, reject) => {
    const connection = createConnection(true);
    connection.query(
      `SELECT * FROM missions WHERE id = ?`,
      [id],
      function(error, results, fields) {
        if (error || results.length !== 1) {
          reject(error);
        } else {
          resolve(
            {
              id: results[0].id,
              need_created_at: results[0].need_created_at,
              state: results[0].state,
            }
          );
        }
        connection.destroy();
      }
    );
  });
}

const updateMission = (mission) => {
  return new Promise((resolve, reject) => {
    const connection = createConnection(true);
    connection.query(
      `UPDATE missions SET
      state = ?
      WHERE id = ?`,
      [mission.state, mission.id],
      function(error, results, fields) {
        if (error || results.length !== 1) {
          reject(error);
        } else {
          resolve();
        }
        connection.destroy();
      }
    );
  });
}

module.exports = {
  createNeed,
  getMission,
  updateMission,
};
