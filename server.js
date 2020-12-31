let express = require('express');
let fs = require('fs');
let pdf = require('html-pdf');
let htmlDocx = require('html-docx-js');

let app = express();

app.use(express.static('public'));

app.use(function(req,res,next){
    res.setHeader('Access-Control-Allow-Origin','*');
    //res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    //res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


app.get('/',function(req,res){
    res.sendFile(__dirname + "/" + "index.html" );
})

app.get('/generate_resume',function(request,response){
    let name = request.query.name;
    let email = request.query.email;
    let designation = request.query.designation;
    let objective = request.query.objective;
    let template = request.query.template;

    let file_name = "resume.html";
    if(template == "template1"){
        file_name = "template1.html";
    }
    else if(template == "template2"){
        file_name = "template2.html";
    }
    
    let html = fs.readFileSync(__dirname+'/public/templates/'+file_name,'utf8');
    
    html = html.replace("{{user_name}}",name);
    html = html.replace("{{user_email}}",email);
    html = html.replace("{{user_designation}}",designation);
    html = html.replace("{{user_objective}}",objective);

    let options = { format:'Letter'};
    pdf.create(html,options).toFile(__dirname+'/public/resumes/resume.pdf',(err,res) => {
        let responseData = {};
        if(err) responseData = {error:"pdf error"};
        else responseData["pdf_file"] = "http://127.0.0.1:8081/resumes/resume.pdf";


        const blob = htmlDocx.asBlob(html,{orientation:'landscape',margins:{top:720}});
        fs.createWriteStream(__dirname+'/public/resumes/resume.docx').write(blob);
        responseData["docx_file"] = "http://127.0.0.1:8081/resumes/resume.docx";

        response.end(JSON.stringify(responseData));
    });    
})

const port = process.env.PORT || 8080;

let server = app.listen(port,function(){
    let host = server.address().address
    let port = server.address().port
    console.log("App listening at http://127.0.0.1:8081");
})