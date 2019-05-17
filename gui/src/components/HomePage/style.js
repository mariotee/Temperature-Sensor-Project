//syntactic sugar for the following:
/*
export default function(theme) {
  return ({
    button: {},
    ...
  })
}
*/
//theme comes from material ui: https://material-ui.com/customization/default-theme/#default-theme
//many of the object keys can be overridden to make our own theme
export default (theme) => ({
  //this reference will be called from the component for className
  //example <Button className={this.props.classes.button}>Click Me</Button>
  button: {
    //getting the theme variable for spacing.unit which equals 8
    margin: `${theme.spacing.unit}px`,
    backgroundColor: '#30c0ff',
    //adding the CSS pseudo element hover
    //& is used here to append to the button object 
    //(becomes even more useful with deeper nesting)
    '&:hover': {
      backgroundColor: '#3090cc',
    },
  },
  input: {    
    margin: `${theme.spacing.unit}px`,
    backgroundColor: '#ccf0ff',
  },
  phoneInput: {
    minWidth: '300px',    
    margin: `${theme.spacing.unit}px`,
    backgroundColor: '#ccf0ff',
  },
  footer: {
    margin: '32px 0 16px 0',
    fontSize: '14px',
    float: 'right',
  },
})