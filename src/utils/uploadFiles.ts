import { createWriteStream } from "fs";
const fs = require("fs")
const checkDirectory = async (userId: any) => {
    const dir = `./src/uploads/${userId}`;
    if (!fs.existsSync(dir)) {
        await fs.mkdirSync(dir, {
            recursive: true
        });
    }
    return dir
}
export const uploadFiles = async (file: any, userId: any) => {
    const dir = await checkDirectory(userId)
    const filename = new Date().toISOString().replace(/:/g, " ") + "-" + file.filename

    const filepath =
        await file.createReadStream()
            .pipe(createWriteStream(`${dir}/${filename}`))
            .on("finish", async () => {
                return (true);
            })
            .on("error", (err: Error) => {
                console.log("Error", err);
                throw (err)
            })
    if (filepath) {
        return filepath.path.substring(14)
    }
    else {
        throw "Something Went Wrong"
    }
}