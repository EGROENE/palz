const CountriesDropdownListWithSearch = ({
  searchQuery,
  queryHandler,
  onFocus,
  onBlur,
  focusedElement,
  randomColor,
  inputRef,
  list,
  itemClick,
}: {
  searchQuery: string;
  queryHandler: Function;
  onFocus: Function;
  onBlur: Function;
  focusedElement: string;
  randomColor: string | undefined;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  list: {
    country: string;
    abbreviation: string;
    phoneCode: string;
  }[];
  itemClick: (country: {
    country: string;
    abbreviation: string;
    phoneCode: string;
  }) => void;
}) => {
  return (
    <>
      <div className="dropdown-list-search-input">
        <input
          value={searchQuery}
          onChange={(e) => queryHandler(e.target.value)}
          type="search"
          placeholder="Search countries"
          onFocus={() => onFocus()}
          onBlur={() => onBlur()}
          style={
            focusedElement === "eventCountriesSearch"
              ? {
                  boxShadow: `0px 0px 10px 2px ${randomColor}`,
                  outline: "none",
                }
              : undefined
          }
          ref={inputRef}
        />
      </div>
      <ul className="dropdown-list">
        {list
          .filter((c: { country: string; abbreviation: string; phoneCode: string }) => {
            if (
              c.abbreviation
                .toLowerCase()
                .includes(searchQuery.replace(/\s/g, "").toLowerCase()) ||
              c.country
                .toLowerCase()
                .includes(searchQuery.replace(/\s/g, "").toLowerCase())
            ) {
              return c;
            }
          })
          .map((country) => (
            <li
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  itemClick(country);
                }
              }}
              style={
                country.country === "United States"
                  ? {
                      "borderBottom": "1px dotted white",
                    }
                  : undefined
              }
              key={country.country}
              onClick={() => itemClick(country)}
            >
              <img src={`/flags/1x1/${country.abbreviation}.svg`} />
              <span>{`${country.country} +${country.phoneCode}`}</span>
            </li>
          ))}
      </ul>
    </>
  );
};
export default CountriesDropdownListWithSearch;
