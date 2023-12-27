/**
 * Copyright (R) 2023, Lanex Corporation
 *
 * @project Uplist
 * @since: March 14, 2023
 * @created_time 08:30:30 AM
 * @author: Elmer Alluad Jr.
 */

import JsPbkdf2 from "js-pbkdf2";
import { webcrypto } from "crypto";
import config from "~/config";
const jsPbkdf2 = new JsPbkdf2(webcrypto);

/**
 * Handler function for the API route.
 * This function is called every time login or logout is called.
 * set cookie for login and remove cookie for logout
 *
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function handler(req, res) {
  if (req.method == "POST") {
    const { uplist } = req.body;
    try {
      const decrypt = await jsPbkdf2.decryptData(config.securityApp, uplist);

      const parsed = JSON.parse(decrypt);

      if (parsed.key === "uplist-key-login") {
        res.setHeader(
          "Set-Cookie",
          `userData=${parsed.user}; path=/; HttpOnly; Secure; SameSite=Lax`
        );

        return res.status(200).json({ message: "OK" });
      }

      if (parsed.key === "uplist-key-logout") {
        res.setHeader(
          "Set-Cookie",
          `userData=; path=/;  expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax;`
        );

        return res.status(200).json({ message: "OK" });
      }

      return res.status(400).json({ message: "Bad request" });
    } catch (error) {
      return res.status(400).json({ message: "Bad request" });
    }
  } else {
    return res.status(405).json({ message: "Method not allowed" });
  }
}
