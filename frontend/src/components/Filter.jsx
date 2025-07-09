export default function Filter(props){
    const { buttons, filter, setFilter } = props;

    return <div className="filter-controls">
            {buttons.map((button) => (
              <button 
                key={button.toLowerCase()}
                className={`filter-btn ${filter === button.toLowerCase() ? "active" : ""}`}
                onClick={() => setFilter(button.toLowerCase())}
              >
                {button}
              </button>
            ))}
          </div>
}