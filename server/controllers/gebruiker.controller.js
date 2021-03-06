const {
    createGebruiker,
    getGebruikerById,
    getGebruikers,
    updateGebruiker,
    deleteGebruiker,
    getGebruikerByEmail
} = require("../models/gebruiker.model");

const {
    genSaltSync,
    hashSync,
    compareSync
} = require("bcrypt");
const {
    sign
} = require("jsonwebtoken");

module.exports = {
    createGebruiker: (req, res) => {
        const body = req.body;
        const salt = genSaltSync(10);
        body.wachtwoord = hashSync(body.wachtwoord, salt);
        createGebruiker(body, (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Er is een probleem met het verbinden met het database!"
                });
            }
            return res.status(200).json({
                success: 1,
                data: results
            });
        });
    },
    getGebruikerById: (req, res) => {
        const gebruiker_id = req.params.id;
        getGebruikerById(gebruiker_id, (err, results) => {
            if (err) {
                console.log(err);
                return;
            }
            if (!results) {
                return res.status(404).json({
                    succes: 0,
                    message: "Gebruiker bestaat niet!"
                });
            }
            return res.status(200).json({
                success: 1,
                data: results
            });
        });
    },
    getGebruikerByEmail: (req, res) => {
        const email = req.params.email;
        getGebruikerByEmail(email, (err, results) => {
            if (err) {
                console.log(err);
                return;
            }
            if (!results) {
                return res.status(404).json({
                    succes: 0,
                    message: "Gebruiker bestaat niet!"
                });
            }
            return res.status(200).json({
                success: 1,
                data: results
            });
        });
    },
    getGebruikers: (req, res) => {
        getGebruikers((err, results) => {
            if (err) {
                console.log(err);
                return;
            }
            if (!results) {
                return res.status(204).json({
                    success: 0,
                    message: "Er bestaan nog geen gebruikers!"
                });
            }
            return res.status(200).json({
                success: 1,
                data: results
            });
        });
    },
    updateGebruiker: (req, res) => {
        const body = req.body;
        const salt = genSaltSync(10);
        body.wachtwoord = hashSync(body.wachtwoord, salt);
        const gebruiker_id = req.params.id;
        getGebruikerById(gebruiker_id, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            if (!result) {
                return res.status(404).json({
                    success: 0,
                    message: "Gebruiker bestaat niet!"
                });
            } else {
                updateGebruiker(body, gebruiker_id, (err, results) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    return res.status(200).json({
                        success: 1,
                        message: "Succesvol geupdate!"
                    });
                });
            }
        });


    },
    deleteGebruiker: (req, res) => {
        const data = req.params.id;
        getGebruikerById(data, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            if (!result) {
                return res.status(404).json({
                    success: 0,
                    message: "Gebruiker bestaat niet!"
                });
            } else {
                deleteGebruiker(data, (err) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    return res.status(200).json({
                        success: 1,
                        message: "Gebruiker succesvol verwijderd"
                    });
                });
            }
        });

    },
    login: (req, res) => {
        const body = req.body;
        getGebruikerByEmail(body.email, (err, results) => {
            if (err) {
                console.log(err);
            }
            if (!results) {
                return res.status(401).json({
                    success: 0,
                    data: "Email of wachtwoord incorrect!"
                });
            }
            const result = compareSync(body.wachtwoord, results.wachtwoord);
            // incase theres an error when testing this moet je ipv results.wachtwoord: results[0].wachtwoord schrijven
            if (result) {
                results.wachtwoord = undefined;
                const jsonToken = sign({
                    result: results
                }, process.env.KEY, {
                    expiresIn: "10h"
                });
                return res.status(200).json({
                    success: 1,
                    message: "Login Succesvol",
                    token: jsonToken,
                    gebruiker_id: results.id
                });
            } else {
                return res.status(401).json({
                    success: 0,
                    data: "Email of wachtwoord incorrect!"
                });
            }
        });
    }
};