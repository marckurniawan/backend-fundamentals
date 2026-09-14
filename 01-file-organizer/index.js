import fs from "node:fs/promises";
import path from "node:path";

const extensionMap = {
    // images
    ".jpg": "images",
    ".jpeg": "images",
    ".png": "images",
    ".gif": "images",
    ".webp": "images",
    ".svg": "images",

    // documents
    ".pdf": "documents",
    ".doc": "documents",
    ".docx": "documents",
    ".txt": "documents",
    ".xlsx": "documents",
    ".xls": "documents",
    ".pptx": "documents",
    ".ppt": "documents",
    ".csv": "documents",

    // audio
    ".mp3": "audio",
    ".wav": "audio",
    ".flac": "audio",
    ".m4a": "audio",

    // videos
    ".mp4": "videos",
    ".mkv": "videos",
    ".avi": "videos",
    ".mov": "videos",

    // archives
    ".zip": "archives",
    ".rar": "archives",
    ".7z": "archives",

    // code
    ".js": "code",
    ".jsx": "code",
    ".ts": "code",
    ".tsx": "code",
    ".html": "code",
    ".css": "code",
    ".json": "code"
};

const folderPath = process.argv[2];

async function main() {
    if(!folderPath){
        console.error("Error: Enter the folder path!");
        process.exit(1);
    }

    try{
        const stats = await fs.stat(folderPath);

        if(!stats.isDirectory()){
            console.error(`Error: ${folderPath} is not a folder.`);
            process.exit(1);
        }

        const files = await fs.readdir(folderPath);

        for (const file of files){
            const sourcePath = path.join(folderPath, file);

            const fileStats = await fs.stat(sourcePath);

            if(!fileStats.isFile()){
                continue;
            }

            const extension = path.extname(file).toLowerCase();

            const category = extensionMap[extension] ?? "others";

            const categoryPath = path.join(folderPath, category);
            await fs.mkdir(categoryPath, {recursive: true});

            let destinationPath = path.join(categoryPath, file);
            let counter = 1;

            while (true) {
                try {
                    await fs.access(destinationPath);

                    const baseName = path.basename(file, extension);

                    destinationPath = path.join(
                        categoryPath,
                        `${baseName}(${counter})${extension}`
                    );

                    counter++;
                } catch (error) {
                    if(error.code === "ENOENT"){
                        break;
                    }
                    throw error
                }
            }

            await fs.rename(sourcePath, destinationPath);

            console.log(`${file} - ${category}`);
        
        }

        
    }
    catch (error){
        if(error.code === "ENOENT"){
            console.error(`Error: ${folderPath} does not exist.`)
        }else if (error.code === "EACCES"){
            console.error(`Error:  Permission denied for ${folderPath}`);
        }else{
            console.error(`Error: ${error.message}`);
        }
        process.exit(1);
    }

    
}

main();
