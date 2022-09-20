const fs = require("fs")
const http = require("http")
const url = require("url")


////////////////////////////////////////////////////////////////
// FILES


// Syncronous way, Blocking code

// 1. reading files with fs.readFileSync()

// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// console.log(textIn);

// 2.  writing into files and creating files with fs.writeFileSync()

// const textOut = `this is what we know about the avocado: ${textIn}.\nCeated on ${Date.now()}`
// fs.writeFileSync("./txt/output.txt", textOut)
// console.log("File written!");



// asyncronous way, non-Blocking code with callbacks and fs.readFile(). the machine will read the file in the background and call the callback function when the file is ready.

// fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
//     if(err) return console.log("Error!");

//     fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
//         console.log(data2);
//         fs.readFile(`./txt/append.txt`, "utf-8", (err, data3) => {
//             console.log(data3);

//             fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", err => {
//                 console.log("your file has been written");
//             })
//         })
//     })
// })


//////////////////////////////////////////////////////////////
// SERVER
// we are replacing the ProductName in tempCard with our item.productName for every of the 5 objects in dataObject. 
const replaceTemplate = (template, item) => {
    let output = template.replace(/{%PRODUCTNAME%}/g,item.productName) // regular expression will replace all the placeholder and not just the first one
    output = output.replace(/{%IMAGE%}/g,item.image)
    output = output.replace(/{%QUANTITY%}/g,item.quantity)
    output = output.replace(/{%PRICE%}/g,item.price)
    output = output.replace(/{%FROM%}/g,item.from)
    output = output.replace(/{%NUTRIENTS%}/g,item.nutrients)
    output = output.replace(/{%DESCRIPTION%}/g,item.description)
    output = output.replace(/{%ID%}/g,item.id)

    if (!item.organic) {
        output = output.replace(/{%NOT_ORGANIC%}/g, "not-organic") // this replaces a class in the div inside template-product.html. Thats why the organix sign is shown for organic products and not for non-organic products.
    }
    return output
}

// we read the data.json file and convert it into a JS object
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8")
const dataObject = JSON.parse(data)

// reading the template html files and storing value into variables. We read the files outside the createServer callback function because we dont want to read the templates everytime a request is going to the server. Thats why we can use Synchronous code here.
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, "utf-8")
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, "utf-8")
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, "utf-8")



// creating the server:
const server = http.createServer((req, res) => {
    // destructering the two objects query and pathname inside req.url:
    // query object holds the id of the product, pathname holds the path url
    console.log(url.parse(req.url, true));
    const {query, pathname} = url.parse(req.url, true);

    //Routing: Overview page
    if(pathname === "/" || pathname==="/overview") {
    res.writeHead(200, {"Content-type" : "text/html"})

    // map through dataObject array of objects and call on every object the replaceTemplate(tempCard,item) function. We pass as arguments the tempCard which we read already and the item, which is the current object when we map through.
    const cardsHtml = dataObject.map(item => replaceTemplate(tempCard, item)).join("") // after we got an array of 5 objects with replaced data from our API we convert it back to a string

    // here we finally replace {%PRODUCT_CARDS%} with our cardsHtml string. Which is all 5 Cards with replaced data from our 5 objects in API
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml)

    res.end(output)
        
    // Product page
    }else if ( pathname === "/product") {
        const product = dataObject[query.id]
        res.writeHead(200, {"Content-type" : "text/html"})
        const output = replaceTemplate(tempProduct, product)
        res.end(output)
        // res.end("This is the product")
    // API
    }else if ( pathname==="/api") {
            res.writeHead(200, {"Content-type" : "application/json"})
            res.end(data)
    // Not found 404 page
    } else {
        res.writeHead(404, {
            "Content-type": "text/html",
            "my-own-header": "hello-world"
        })
        res.end("<h1>page not found!</h1>")
    }
})

server.listen(8000, "127.0.0.1", () => {
    console.log("Listening to requests on port 8000");
})