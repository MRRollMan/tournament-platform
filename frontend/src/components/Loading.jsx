export default function Loading(props) {
    return <div className="loader-container">
        <div className="loader"></div>
        <p>{props.text}</p>
    </div>
}