import fs from "node:fs/promises";

const util = {};

//the below becomes a function inside an object
//delete file if exist if not func wont throw error

util.deleteFile = async (path) => {
  try {
    /** If path refers to a symbolic link, then the link is removed without affecting the file or directory to which that link refers. If the path refers to a file path that is not a symbolic link, the file is deleted. See the POSIX unlink(2) documentation for more detail.*/
    await fs.unlink(path);
  } catch (error) {
    // do nothing
  }
};

//delete if exist, if not function will not throw an error
util.deleteFolder = async (path) => {
  try {
    await fs.rm(path, { recursive: true });
  } catch (error) {
    //do nothing
  }
};

export default util;
