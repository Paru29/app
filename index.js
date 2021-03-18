
const http=require('http'); 
const fs=require("fs"); 
const path=require("path"); 
  
/* http.createServer takes a handler  
   function and returns a server instance;*/
const server=http.createServer((req, res)=>{ 
    // return res.end(req.url+req.method); 
    if(req.method==='GET' && req.url==="/"){ 
        /*we will send a index.html page when  
          user visits "/" endpoint*/
        /*index.html will have video component  
          that displays the video*/
        fs.createReadStream(path.resolve("index.html")).pipe(res); 
        return; 
    } 
    //if video content is requesting 
    if(req.method==='GET' && req.url==="/video"){ 
        const filepath = path.resolve("video.mp4"); 
        const stat = fs.statSync(filepath) 
        const fileSize = stat.size 
        const range = req.headers.range 
        /*when we seek the video it will put  
          range header to the request*/
        /*if range header exists send some  
            part of video*/
        if (range) { 
            //range format is "bytes=start-end",  
            const parts =  
                range.replace(/bytes=/, "").split("-"); 
             
            const start = parseInt(parts[0], 10) 
            /*in some cases end may not exists, if its  
                          not exists make it end of file*/
            const end =  
                 parts[1] ?parseInt(parts[1], 10) :fileSize - 1 
              
            //chunk size is what the part of video we are sending. 
            const chunksize = (end - start) + 1 
            /*we can provide offset values as options to 
           the fs.createReadStream to read part of content*/
            const file = fs.createReadStream(filepath, {start, end}) 
              
            const head = { 
                'Content-Range': `bytes ${start}-${end}/${fileSize}`, 
                'Accept-Ranges': 'bytes', 
                'Content-Length': chunksize, 
                'Content-Type': 'video/mp4', 
            } 
            /*we should set status code as 206 which is 
                    for partial content*/
            // because video is continuosly fetched part by part  
            res.writeHead(206, head); 
          file.pipe(res); 
            
        }else{ 
          
        //if not send the video from start.  
        /* anyway html5 video player play content 
          when sufficient frames available*/
        // It doesn't wait for the entire video to load. 
          
           const head = { 
               'Content-Length': fileSize, 
               'Content-Type': 'video/mp4', 
           } 
           res.writeHead(200, head); 
           fs.createReadStream(path).pipe(res); 
        } 
    } 
    /*if anything other than handler routes then send 
      400 status code, is for bad request*/
    else{ 
        res.writeHead(400); 
        res.end("bad request"); 
    } 
}) 
  
/*check if system has environment variable  
   for the port, otherwise defaults to 3000*/
const PORT = process.env.PORT || 8000; 
  
//start the server 
server.listen(PORT, () => { 
  console.log(`server listening on port:${PORT}`); 
}) 
