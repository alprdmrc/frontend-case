import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./App.css";

function App() {
  const [searchText, setSearchText] = useState("");
  const [drop, setDrop] = useState(false);
  const [selecteds, setSelecteds] = useState([]);
  const [optionsData, setOptionsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  //Debounce func
  const debounce = (func, delay) => {
    let timeout = null;
    return (...args) => {
      if (timeout) clearTimeout(timeout);

      timeout = setTimeout(() => {
        func(...args);
        timeout = null;
      }, delay);
    };
  };

  //Input change with 400ms delay
  const handleInputChange = debounce((e) => {
    setSearchText(e.target.value);
  }, 400);

  //Add or remove option
  const toggleOption = useCallback(
    (option) => {
      if (!selecteds.find((item) => item.id === option.id)) {
        // console.log("added", option);
        setSelecteds((prev) => [...prev, option]);
      } else {
        // console.log("removed", option);
        setSelecteds((prev) => prev.filter((item) => item.id !== option.id));
      }
    },
    [selecteds]
  );

  //Fetching data
  const getCharacters = async (searchText) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://rickandmortyapi.com/api/character/?name=${searchText}`
      );
      const data = await res.json();
      // console.log(data);
      setOptionsData(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  //Rendered dropdown items
  const rows = loading ? (
    <div className="h-5 w-5 animate-spin rounded-full border border-solid border-black border-t-slate-400 my-3 mx-auto"></div>
  ) : optionsData.results?.length > 0 ? (
    optionsData.results.map((data, index) => (
      <OptionRow
        key={index}
        option={data}
        toggleOption={toggleOption}
        selecteds={selecteds}
        searchText={searchText}
        isFocused={focusedIndex === index}
      />
    ))
  ) : (
    <div className="bg-white text-black text-center w-full">No Option</div>
  );

  //Fetch data when search text changed
  useEffect(() => {
    getCharacters(searchText);
  }, [searchText]);

  //Handling keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (drop) {
        switch (e.key) {
          case "Escape":
            setDrop(false);
            break;
          case "ArrowDown":
            setFocusedIndex((prevIndex) =>
              prevIndex < optionsData.results.length - 1 ? prevIndex + 1 : 0
            );
            break;
          case "ArrowUp":
            setFocusedIndex((prevIndex) =>
              prevIndex > 0 ? prevIndex - 1 : optionsData.results.length - 1
            );
            break;
          case "Enter":
            if (
              focusedIndex >= 0 &&
              focusedIndex < optionsData.results.length
            ) {
              toggleOption(optionsData.results[focusedIndex]);
            }
            break;
          default:
            break;
        }
      }
    };

    if (drop) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [drop, focusedIndex, optionsData, toggleOption]);

  return (
    <>
      <div className="relative">
        <div className="w-[400px] h-[40px] bg-white rounded-xl text-black absolute flex flex-row justify-between">
          <div className="w-[368px] overflow-x-auto h-[40px] flex flex-row gap-1 py-1 scrollbar-hide relative mx-1">
            {selecteds.map((option, index) => (
              <div
                className="text-black bg-slate-400 z-10 rounded-lg flex py-0.5 px-2 gap-1"
                key={index}
              >
                <span className="whitespace-nowrap self-center text-slate-800">
                  {option.name}
                </span>
                <button
                  onClick={() => toggleOption(option)}
                  className="bg-slate-600 p-1 rounded-md h-5 w-5 leading-none self-center flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    className="text-white w-4 h-4"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill="currentColor"
                      d="M15.328 6.124a1.03 1.03 0 1 0-1.456-1.456L10 8.596 6.128 4.668a1.03 1.03 0 1 0-1.456 1.456L8.6 9.996l-3.928 3.872a1.03 1.03 0 1 0 1.456 1.456L10 11.396l3.872 3.928a1.03 1.03 0 1 0 1.456-1.456L11.4 9.996l3.928-3.872Z"
                    />
                  </svg>
                </button>
              </div>
            ))}
            <input
              onChange={handleInputChange}
              onFocus={() => setDrop(true)}
              className="w-full min-w-max bg-white outline-none"
            />
          </div>
          <button
            onClick={() => setDrop((prev) => !prev)}
            className="p-2 border-l"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              className={`${drop && "rotate-180"} w-4 h-4 self-end`}
              viewBox="0 0 20 20"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M1.697 5.607a.91.91 0 0 0 0 1.253l7.069 7.324c.667.692 1.75.692 2.418 0l7.12-7.377a.91.91 0 0 0 .01-1.244.834.834 0 0 0-1.219-.01l-6.515 6.753a.834.834 0 0 1-1.21 0L2.906 5.607a.833.833 0 0 0-1.209 0Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        {drop && (
          <div className="w-[400px] max-h-[400px] overflow-y-auto flex flex-col divide-y-2 bg-white rounded-xl absolute top-[45px]">
            {rows}
          </div>
        )}
      </div>
    </>
  );
}

const OptionRow = (props) => {
  const option = props.option;
  const toggleOption = props.toggleOption;
  const selecteds = props.selecteds;
  const searchText = props.searchText;
  const isFocused = props.isFocused;

  const nameParts = option.name.split(new RegExp(`(${searchText})`, "gi"));

  const isSelected = selecteds.find((item) => item.id === option.id);
  return (
    <li
      role="option"
      className={`${
        isFocused && "bg-slate-100"
      } flex gap-1 p-2 items-center text-black`}
      onClick={() => toggleOption(option)}
    >
      <input type="checkbox" checked={isSelected || false} readOnly />
      <img src={option.image} alt="" className="w-10 h-10 rounded-md" />
      <div className="flex flex-col gap-0.5">
        <span className="leading-tight">
          {nameParts.map((part, index) =>
            part.toLowerCase() === searchText.toLowerCase() ? (
              <b key={index}>{part}</b>
            ) : (
              part
            )
          )}
        </span>
        <span className="leading-tight">{option.episode.length}</span>
      </div>
    </li>
  );
};

OptionRow.propTypes = {
  option: PropTypes.object,
  toggleOption: PropTypes.func,
  selecteds: PropTypes.array,
  searchText: PropTypes.string,
  isFocused: PropTypes.bool,
};

export default App;
