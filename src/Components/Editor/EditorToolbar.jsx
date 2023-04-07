import React from "react";
import { Quill } from "react-quill";
import { useState, useEffect } from "react";
import "./EditorToolbar.scss";

// Custom Undo button icon component for Quill editor. You can import it directly
// from 'quill/assets/icons/undo.svg' but I found that a number of loaders do not
// handle them correctly

const CustomUndo = () => (
  <svg viewBox="0 0 18 18">
    <polygon className="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10" />
    <path
      className="ql-stroke"
      d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9"
    />
  </svg>
);

// Redo button icon component for Quill editor
const CustomRedo = () => (
  <svg viewBox="0 0 18 18">
    <polygon className="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10" />
    <path
      className="ql-stroke"
      d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5"
    />
  </svg>
);

// Undo and redo functions for Custom Toolbar
function undoChange() {
  this.quill.history.undo();
}
function redoChange() {
  this.quill.history.redo();
}
function insertPDF() {
  const url = sessionStorage.getItem("myData");
  if (url === "null") return;
  url.replace("watch?v=", "v/");
  const selection = this.quill.getSelection(true);
  this.quill.clipboard.dangerouslyPasteHTML(
    selection.index,
    `
  <a href=${url} rel="noopener noreferrer" target="_blank">link</a><iframe class="ql-video" src=${url}></iframe>
`
  );

  sessionStorage.setItem("myData", null);
}

// Add sizes to whitelist and register them
const Size = Quill.import("formats/size");
Size.whitelist = ["extra-small", "small", "medium", "large"];
Quill.register(Size, true);

// Add fonts to whitelist and register them
const Font = Quill.import("formats/font");
Font.whitelist = [
  "arial",
  "comic-sans",
  "courier-new",
  "georgia",
  "helvetica",
  "lucida",
];
Quill.register(Font, true);

// Modules object for setting up the Quill editor
export const modules = {
  toolbar: {
    container: "#toolbar",
    handlers: {
      undo: undoChange,
      redo: redoChange,
      pdf: insertPDF,
    },
  },
  history: {
    delay: 500,
    maxStack: 100,
    userOnly: true,
  },
};

// Formats objects for setting up the Quill editor
export const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "align",
  "strike",
  "script",
  "blockquote",
  "background",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
  "color",
  "code-block",
];

// Quill Toolbar component

export const QuillToolbar = () => {
  const [inputValue, setInputValue] = useState(null);
  useEffect(() => {
    const storedData = sessionStorage.getItem("myData");
    if (storedData) {
      sessionStorage.setItem("myData", null);
    }
  }, []);

  console.log(sessionStorage.getItem("myData"));
  return (
    <div id="toolbar">
      <span className="ql-formats">
        <select className="ql-font" defaultValue="arial">
          <option value="arial">Arial</option>
          <option value="comic-sans">Comic Sans</option>
          <option value="courier-new">Courier New</option>
          <option value="georgia">Georgia</option>
          <option value="helvetica">Helvetica</option>
          <option value="lucida">Lucida</option>
        </select>
        <select className="ql-size" defaultValue="medium">
          <option value="extra-small">Size 1</option>
          <option value="small">Size 2</option>
          <option value="medium">Size 3</option>
          <option value="large">Size 4</option>
        </select>
        <select className="ql-header" defaultValue="3">
          <option value="1">Heading</option>
          <option value="2">Subheading</option>
          <option value="3">Normal</option>
        </select>
      </span>
      <span className="ql-formats">
        <button className="ql-bold" />
        <button className="ql-italic" />
        <button className="ql-underline" />
        <button className="ql-strike" />
      </span>
      <span className="ql-formats">
        <button className="ql-list" value="ordered" />
        <button className="ql-list" value="bullet" />
        <button className="ql-indent" value="-1" />
        <button className="ql-indent" value="+1" />
      </span>
      <span className="ql-formats">
        <button className="ql-script" value="super" />
        <button className="ql-script" value="sub" />
        <button className="ql-blockquote" />
        <button className="ql-direction" />
      </span>
      <span className="ql-formats">
        <select className="ql-align" />
        <select className="ql-color" />
        <select className="ql-background" />
      </span>
      <span className="ql-formats">
        <button className="ql-link" />
        <button className="ql-image" />
        <button className="ql-video" />
      </span>

      <span className="ql-formats">
        <button className="ql-formula" />
        <button className="ql-code-block" />
        <button className="ql-clean" />
      </span>

      <span className="ql-formats">
        <div className="custom-pdf-btn">
          <button
            onClick={() => {
              const container = document.querySelector(".pdf-container");
              const visibility = container.style.visibility;
              container.style.visibility =
                visibility === "visible" ? "hidden" : "visible";
            }}
          >
            PDF
          </button>

          <div className="pdf-container">
            <p>Enter PDF: </p>

            <input
              type="text"
              className="pdf-url-input"
              placeholder="Embeded URL"
              value={inputValue === null ? "" : inputValue}
              onChange={(e) => {
                sessionStorage.setItem(
                  "myData",
                  JSON.stringify(e.target.value)
                );
                setInputValue(e.target.value);
              }}
              onPaste={(e) => {
                sessionStorage.setItem(
                  "myData",
                  JSON.stringify(e.clipboardData.getData("text"))
                );
                setInputValue(e.clipboardData.getData("text"));
              }}
            ></input>
            <button
              className="ql-pdf pdf-submit-btn"
              type="submit"
              onClick={(e) => {
                const container = document.querySelector(".pdf-container");
                container.style.visibility = "hidden";
                sessionStorage.setItem("myData", null);
                setInputValue(null);
              }}
            >
              Save
            </button>
          </div>
        </div>
      </span>

      <span className="ql-formats">
        <button className="ql-undo">
          <CustomUndo />
        </button>
        <button className="ql-redo">
          <CustomRedo />
        </button>
      </span>
    </div>
  );
};

export default QuillToolbar;