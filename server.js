let express = require('express');
var bodyParser = require('body-parser');
let fs = require('fs');
let pdf = require('html-pdf');
let htmlDocx = require('html-docx-js');

const server_url = "https://resume-builder-node.herokuapp.com";
//const server_url = "http://127.0.0.1:8080";

let app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static('public'));

app.use(function(req,res,next){
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    //res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});


app.get('/',function(req,res){
    res.sendFile(__dirname + "/" + "index.html" );
})

app.post('/generate_resume',function(req,res){
    let name = req.body.name;
    let email = req.body.email;
    let designation = req.body.designation;
    let objective = req.body.objective;
    let template = req.body.template;

    let font_size = req.body.font_size || "14";
    let font_style = req.body.font_style || '"Times New Roman", Times, serif';
    let heading_size = req.body.heading_size || "20";
    let section_spacing = req.body.section_spacing || "10";
    let paragraph_spacing = req.body.paragraph_spacing || "normal";
    let line_spacing = req.body.line_spacing || "normal";
    let text_color = req.body.text_color;

    let file_name = "template1.html";
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

    html = html.replace("{{font_size}}",font_size);
    html = html.replace("{{heading_size}}",heading_size);
    html = html.replace("{{font_style}}",font_style);
    html = html.replace("{{text_color}}",text_color);
    html = html.replace("{{line_spacing}}",line_spacing);
    html = html.replace("{{section_spacing}}",section_spacing);
    html = html.replace("{{paragraph_spacing}}",paragraph_spacing);

    let options = { format:'Letter'};
    pdf.create(html,options).toFile(__dirname+'/public/resumes/resume.pdf',(err,response) => {
        let responseData = {};
        if(err) responseData = {error:"pdf error"};
        else responseData["pdf_file"] = `${server_url}/resumes/resume.pdf`;


        const blob = htmlDocx.asBlob(html,{orientation:'landscape',margins:{top:720}});
        fs.createWriteStream(__dirname+'/public/resumes/resume.docx').write(blob);
        responseData["docx_file"] = `${server_url}/resumes/resume.docx`;

        res.json(responseData);
    });    
})

let port = process.env.PORT || 8080;

let server = app.listen(port,function(){
    let host = server.address().address
    let port = server.address().port
    console.log(`App listening at ${server_url}`);
})