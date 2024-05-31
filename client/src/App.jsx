import { useState } from "react";
import sorryHands from "/sorryHands.png";
import axios from "axios";
import "./App.css";

function App() {
  const [question, setQuestion] = useState("");
  const [instructions, setInstructions] = useState("");
  const [apology, setApology] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);

  function handleInputChange(e) {
    const { value } = e.target;
    setQuestion(value);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setButtonDisabled(true);
    console.log(question);
    import.meta.env.VITE_NODE_ENV === "development"
      ? axios
          .post("http://localhost:3001/api/ask", { question: question })
          .then((res) => {
            console.log("dev", res.data);
            res.data?.result?.instructions
              ? setInstructions(res.data.result.instructions)
              : setInstructions("You did what?!");
            res.data?.result?.apology
              ? setApology(res.data.result.apology)
              : setApology("Sorry, I don't know what to say...");
            setButtonDisabled(false);
            console.log(res);
          })
      : axios
          .post("https://youtubeapologygenerator.onrender.com/api/ask", {
            question: question,
          })
          .then((res) => {
            console.log("prod", res.data);
            res.data?.result?.instructions
              ? setInstructions(res.data.result.instructions)
              : setInstructions("You did what?!");
            res.data?.result?.apology
              ? setApology(res.data.result.apology)
              : setApology("Sorry, I don't know what to say...");
            setButtonDisabled(false);
            console.log(res);
          });
  }

  return (
    <>
      <main>
        <h1>Youtube Apology Generator</h1>
        <img id="sorryHands" src={sorryHands} />
        <form onSubmit={handleSubmit}>
          <h4>What did you to wrong?</h4>
          <input
            onChange={handleInputChange}
            value={question}
            type="text"
          ></input>
          <button disabled={buttonDisabled} type="submit">
            Submit
          </button>
          <section id="output">
            <h4>Instructions:</h4>
            <div id="code">{instructions}</div>
            <h4>Apology:</h4>
            <div id="explanation">{apology}</div>
          </section>
        </form>
      </main>
    </>
  );
}

export default App;
