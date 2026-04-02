import { UserService } from "~/services/user.service";
import { SuccessResponse } from "~/core/success.response";
class UserController {
  createUser = async (req, res) => {
    // Logic to handle user creation
    const { email } = req.body;
    const rs = await UserService.newUser({ email });
    new SuccessResponse({
      message: 'User created successfully',
      metadata: rs,
    }).send(res);
  }

  checkRegisterEmailToken = async () => {
    // lười làm :))
    // check otp rồi tạo user thôi :)))
  }
}

export default UserController = new UserController();