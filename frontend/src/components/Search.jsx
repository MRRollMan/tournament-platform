import { SearchIcon } from "./Icons";

export default function Search(props){
    const { text, searchQuery, setSearchQuery } = props;

    return <div className="search-container">
                <SearchIcon />
                <input
                    type="text"
                    placeholder={text}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>
}


