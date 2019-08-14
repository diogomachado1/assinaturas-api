const mongoose = require('mongoose');

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//import { promisify } from 'util';
const secret = process.env.APP_SECRET || 'test'


class User {


  constructor(email, name, password, admin, created_at, _id) {
    this.email = email;
    this.name = name;
    this.password = password;
    this.admin = admin;
    this.created_at = created_at;
    this._id = _id;
  }


  static async bootstrap() {
    const count = await this.modelUsers.countDocuments({});
    if (count <= 0) {
      const user = await new User('admin@admin.com', 'admin', await bcrypt.hash('admin', 8), true)
      const userNewDoc = await this.modelUsers.create(user)
    }
  }

  async checkPassword(password) {
    return bcrypt.compare(password, this.password)
  }

  async generateToken() {
    return jwt.sign({ _id: this._id, admin: this.admin }, secret)
  }

  static createUserObj(user) {
    return new User(user.email, user.name, user.password, user.admin, user.created_at, user._id ? user._id.toString() : user._id)
  }

  static async login(email, password) {
    const userDoc = await this.modelUsers.findOne({ email });

    if (!userDoc) {
      throw { message: "Credenciais invalidas" }
    } else {
      const user = this.createUserObj(userDoc)
      if (!(await user.checkPassword(password))) {
        throw { message: "Credenciais invalidas" }
      } else {
        return {
          name: user.name,
          email: user.email,
          _id: user._id,
          admin: user.admin,
          token: await user.generateToken()
        }
      }
    }
  }

  static async getAll(user, page, size) {
    const usersDoc = await this.modelUsers.find({ ...user }).limit(size).skip(size * (page - 1))
    const count = await this.modelUsers.countDocuments({ ...user });
    const users = await Promise.all(usersDoc.map(async (user) => {
      user.password = undefined;
      return await this.createUserObj(user)
    }))
    return { data: users, count }
  }

  static async getOne(_id) {
    const usersDoc = await this.modelUsers.findById(_id)
    //const count = await this.modelUsers.countDocuments({...user});
    const user = this.createUserObj(usersDoc)
    user.password = undefined;
    return user
  }

  static async create(email, name, password) {
    const userDoc = await this.modelUsers.findOne({ email })

    if (!userDoc && password) {
      if (password.length >= 8) {
        const user = await new User(email, name, await bcrypt.hash(password, 8))
        const userNewDoc = await this.modelUsers.create(user)

        return this.login(userNewDoc.email, password)
      } else {
        throw { message: "Senha invalida" }
      }
    } else {
      if (!password) {
        throw { message: "Senha requerida" }
      } else {
        throw { message: "Email já cadastrado" }
      }
    }
  }

  static async update(_id, reqUser, user_admin) {
    const user = await this.createUserObj(reqUser)
    if (user_admin === true) {
      if(user.password){
        user.password =  await bcrypt.hash(user.password, 8);
      }else{
        const userPass = await this.modelUsers.findById(_id)
        user.password = userPass.password;
      }
      const userDoc = await this.modelUsers.updateOne({ _id }, user, { new: true, runValidators: true })
      if (userDoc) {
        return await this.createUserObj(userDoc)
      } else {
        throw { message: 'Não encontrado' }
      }
    } else {
      throw { message: 'Apenas usuarios administradores podem alterar outros usuarios' }
    }
  }



  static async delete(_id, user_id) {
    //if(userDoc.admin === true){
    if (user_id !== _id) {
      const userDoc = await this.modelUsers.findOneAndDelete({ _id })
      if (userDoc) {
        return await this.createUserObj(userDoc)
      } else {
        throw { message: 'Não encontrado' }
      }
    } else {
      throw { message: 'Não é possivel deletar sua propria conta' }
    }

  }
  //   } else {
  //     throw {message:'Apenas usuarios administradores podem deletar outros usuarios'}
  //   }
  // }

  static async deleteMany(Array_id, user_id, user_admin) {
    //const userDoc = await this.modelUsers.findOne({ _id })
    if (user_admin === true) {
      Array_id.forEach(id => {
        if (user_id === id) {
          throw { message: 'Não é possivel deletar sua propria conta' }
        }
      });
      const userDoc = await this.modelUsers.deleteMany({ _id: { $in: Array_id } })
      if (userDoc) {
        return await { data: Array_id }
      } else {
        throw { message: 'Não encontrado' }
      }
    } else {
      throw { message: 'Apenas usuarios administradores podem alterar outros usuarios' }
    }
  }
}


User.modelUsers = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true, maxlength: 50, minlength: 3 },
  email: { type: String, required: true, min: 0 },
  password: { type: String, required: true, minlength: 8 },
  admin: { type: Boolean, required: true, default: false },
  created_at: { type: Date, required: true, default: Date.now() },
}))

module.exports = User;