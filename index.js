const fs = require("fs");
const express = require("express");
const eta = require("eta");
const bodyParser = require('body-parser');
const dayjs = require('dayjs')
const app = express();

app.engine("eta", eta.renderFile);
eta.configure({ views: "./views", cache: false });
app.set("views", "./views");
app.set("view cache", false);
app.set("view engine", "eta");
app.use(express.static('assets'));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// on créé le fichier JSON s'il n'existe pas
const jsonPath = "invoices.json";

function loadInvoices() {
    if (!fs.existsSync(jsonPath)) fs.writeFileSync(jsonPath, "[]", "utf8");
    let invoicesObj = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    if (!Array.isArray(invoicesObj)) invoicesObj = [];
    return invoicesObj;
}
function saveInvoices() {
    fs.writeFileSync(jsonPath, JSON.stringify(invoices), "utf8");
}
function getNextId() {
    return invoices.length > 0 ? invoices[invoices.length - 1].id + 1 : 1;
}

let invoices = loadInvoices();

// on redirige l'url / vers la liste des invoices
app.get("/", function (req, res) {
    res.redirect("/list");
});
app.get("/list", function (req, res) {
    res.render("list.eta", {}); // ne rien modifier ici :-)
});
app.get("/edit/:id", function (req, res) {
    res.render("form.eta", {}); // ne rien modifier ici :-)
});


// retourne la liste des factures
app.get("/invoices", function (req, res) {
    let invoicesToReturn = invoices.filter(invoice => {
        if (!req.query.search) return true;
        if (invoice.object.indexOf(req.query.search) >= 0) return true;
        return false;
    });
    res.send(invoicesToReturn);

    //    let obSearch;
    //    console.log("search", req.query.search)
    //    if (req.query.search) {
    //        obSearch = invoices.filter(invoice => invoice.object.indexOf(req.query.search) >= 0);
    //        console.log("ob search", obSearch)
    //        res.send(obSearch);
    //    }
    //    else {
    //        res.send(invoices);
    //    }
});

// retourne la facture dont l'id est passé en paramètre
app.get("/invoice/:id", function (req, res) {

    let invoice = invoices.find(invoice => invoice.id == req.params.id);
    if (!invoice && req.params.id != "0") return res.status(404).send({ error: "not_found" });
    if (req.params.id == "0") invoice = {
        id: 0,
        object: "",
        price: 0,
        date: dayjs().format("YYYY-MM-DD")
    };
    res.send(invoice);
    //    let ob;
    //    for (let i = 0; i < invoices.length; i++) {
    //        ob = invoices[i];
    //        if (req.params.id == ob.id) {
    //            res.send(ob);
    //            break;
    //        }
    //    }
    //    console.log(ob);
});
// ajoute une nouvelle facture
app.post("/invoice", function (req, res) {
    let ob = {
        id: getNextId(),
        object: req.body.object,
        date: req.body.date,
        price: req.body.price
    };
    invoices.push(ob)
    saveInvoices()
    res.send(ob)
});
// modifie une facture
app.put("/invoice/:id", function (req, res) {

    let invoice = invoices.find(invoice => invoice.id == req.params.id);
    if (!invoice) return res.status(404).send({ error: "not_found" });
    invoice.object = req.body.object;
    invoice.price = req.body.price;
    invoice.date = req.body.date;
    saveInvoices();
    res.send(invoice);

    // let ob, i;
    // for (i = 0; i < invoices.length; i++) {
    //     ob = invoices[i];
    //     if (ob.id = req.params.id) {
    //         break;
    //     }
    // }
    // invoices[i] = {
    //     id: req.params.id,
    //     object: req.body.object,
    //     date: req.body.date,
    //     price: req.body.price
    // };
    // saveInvoices()
    // res.send(ob)
});
// efface une facture
app.delete("/invoice/:id", function (req, res) {

    let invoice = invoices.find(invoice => invoice.id == req.params.id);
    if (!invoice) return res.status(404).send({ error: "not_found" });
    invoices = invoices.filter(invoice => invoice.id != req.params.id);
    saveInvoices();
    res.send(invoices);

    //  console.log(req.params.id)
    //  let ob;
    //  for (i = 0; i < invoices.length; i++) {
    //      ob = invoices[i];
    //      if (ob.id == req.params.id) {
    //          invoices.splice(i, 1);
    //      }
    //  }
    //  saveInvoices()
    //  res.send(ob)
});

app.listen(8000, function () {
    console.log("listening on port 8000");
});
