import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // not recommended way because... suppose if user uploads a file with the same file name then the new file will overwrite the previous file. Hence losing the file. 
    // RECOMMENDED WAY: Give a unique name to the file.
  }
})

export const upload = multer({ storage,  })