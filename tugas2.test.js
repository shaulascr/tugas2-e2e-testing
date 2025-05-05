const chai = require("chai");
const dotenv = require("dotenv");
const request = require("supertest");
const { expect } = chai;
const json = require('./data/body-data.json');

dotenv.config({ path: ".env" });

let url = process.env.BASE_URL;
let username_api = process.env.API_USERNAME;
let password_api = process.env.API_PASSWORD;
const header = require('./data/header.json');
let statusSuccess = 200;
let statusFailed = 404;
let newToken;
let bookingId;

describe('e2e auth', function () {
    this.timeout(10000);
    before(async function () {
        const body_data = {
            "username": username_api,
            "password": password_api
        }
        
        console.log("Making request to:", `${url}/auth`);
        const res = await request(url).post('/auth').set(header).send(body_data);
        
        console.log("Response status:", res.statusCode);
        console.log("Response body:", res.body);
        
        expect(res.statusCode).to.equal(statusSuccess);
        newToken = res.body.token;
        console.log("Token received:", newToken);
    });
    it("Return Valid Token ", async function() {
        expect(newToken).to.be.a("string");
        expect(newToken.length).to.be.greaterThan(0);
    });
    it("create booking", async function () {
        let data_book = {...json};
        data_book.firstname = "Jim";

        const res = await request(url)
        .post("/booking")
        .set(header)
        .send(data_book);

        bookingId = res.body.bookingid; 
        console.log("booking id");
        console.log(bookingId); 
        expect(res.statusCode).to.equal(200);
        expect(res.body.booking.firstname).to.equal(data_book.firstname);
    });
    it('get booking id', async function () {
        const res = await request(url)
        .get(`/booking/${bookingId}`)
        .set(header);
        
        expect(res.statusCode).to.equal(statusSuccess);
    });
    it('delete booking', async function () {
        const headerDelete = {...header}
        headerDelete.Cookie = `token=${newToken}`
        const res = await request(url)
        .get(`/booking/${bookingId}`)
        .set(headerDelete);
        expect(res.statusCode).to.equal(statusSuccess)
    });
});