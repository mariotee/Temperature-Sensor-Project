//import react library
import React from 'react';
//import the react DOM (document object model) library
import ReactDOM from 'react-dom';
//import main component (root component)
import HomePage from 'components/HomePage';
//import the css file (for bigger projects this would be found with the components)
import './index.css';
//ReactDOM.render function manipulates the HTML DOM to render its virtual DOM
//it takes in the div with id root that we added to the public/index.html file
ReactDOM.render(<HomePage/>,document.getElementById('root')
);
