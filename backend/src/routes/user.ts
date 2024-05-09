import {Hono} from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import {sign , verify} from "hono/jwt"

export const userRouter  = new Hono<{
    Bindings : {
    DATABASE_URL : string
    JWT_SECRET_KEY : string
    }
  }>();

userRouter.post('/signup', async (c) => {
    const body = await c.req.json();
    const prisma =  new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,   
    }).$extends(withAccelerate());
  
    try{
      const user = await prisma.user.create({
        data: {
          username : body.username,
          password : body.password,
          name: body.name
        }
      })
      const jwt =  await sign({ id: user.id} , c.env.JWT_SECRET_KEY);
      return c.json({ jwt });
    } catch (e){
        console.log(e);
        c.status(403);
        return c.json({error : "error while signing up"})
    }
  })
  
  userRouter.post('/signin', async  (c) => {
      const prisma =  new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,   
      }).$extends(withAccelerate());
  
      const body =  await c.req.json();
      const user = await prisma.user.findUnique({
        where: {
          username: body.username,
          password: body.password,
        }
      });
  
      if(!user){
        c.status(403);
        return c.json({ error: "user not found"})
      }
      const jwt =  await sign({ id: user.id} , c.env.JWT_SECRET_KEY);
      return c.json({ jwt });
   
  })
  