import { uploadImageFromUrl, uploadImageFromLocal, uploadImageFromLocalFiles } from "~/services/upload.service"
import { SuccessResponse } from "~/core/success.response"
import { BadRequestError } from "~/core/error.response"

const dataProfiles = [
  {
    user_id: 1,
    user_name: 'john_doe',
    user_avatar: 'https://example.com/avatars/john_doe.jpg',
  },
  {
    user_id: 2,
    user_name: 'jane_smith',
    user_avatar: 'https://example.com/avatars/jane_smith.jpg',
  },
  {
    user_id: 3,
    user_name: 'bob_johnson',
    user_avatar: 'https://example.com/avatars/bob_johnson.jpg',
  }
]

class ProfileController {
  profiles = async (req, res, next) => {
    new SuccessResponse({
      message: "Profiles retrieved successfully",
      metadata: dataProfiles
    }).send(res)
  }
  
  profile = async (req, res, next) => {
    new SuccessResponse({
      message: "Profile retrieved successfully",
      metadata: dataProfiles[1]
    }).send(res)
  }
}

export default  new ProfileController();