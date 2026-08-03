import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const auth = req.headers.get("authorization");

  const user = process.env.APP_USER;
  const pass = process.env.APP_PASS;

  // Se as variáveis não estiverem configuradas, libera o acesso
  // (evita travar o site caso você esqueça de configurar)
  if (!user || !pass) {
    return NextResponse.next();
  }

  if (auth) {
    const [scheme, encoded] = auth.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = Buffer.from(encoded, "base64").toString("utf-8");
      const [reqUser, reqPass] = decoded.split(":");
      if (reqUser === user && reqPass === pass) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Autenticação necessária", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Área restrita"',
    },
  });
}

export const config = {
  matcher: [
    /*
     * Aplica a senha em todas as rotas, exceto arquivos estáticos internos do Next.js
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
