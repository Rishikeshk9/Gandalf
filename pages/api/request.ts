import axios from "axios";

export default async function handler({ req, res }: { req: any; res: any }) {
  try {
    const response = await axios.get("http://localhost:3000");
    const data = response.data;
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching data" });
  }
}
