import React from "react";
import PropTypes from "prop-types";
import injectSheet from "react-jss";
import {
  IconButton,
  MenuItem,
  MenuList,
  Popper,
  ClickAwayListener,
  Grow,
  Paper
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

const styles = theme => ({
  fontSizeSetter: {
    [`@media (min-width: ${theme.mediaQueryTresholds.M}px)`]: {}
  },
  buttonRoot: {
    "&:hover": {
      background: "rgba(0, 0, 0, 0.04)"
    }
  },
  buttonLabel: {
    textTransform: "none",
    fontSize: "1.4em",
    color: "#777"
  },
  popper: {
    zIndex: 1
  }
});

class CategoryFilter extends React.Component {
  state = {
    anchorEl: null,
    open: false
  };

  componentWillUnmount() {
    clearTimeout(this.timeout);
  }

  handleClick = event => {
    const anchorEl = event.currentTarget;
    this.setState(prevState => ({ open: !prevState.open, anchorEl }));
  };

  handleClose = () => {
    if (!this.state.open) {
      return;
    }

    this.timeout = setTimeout(() => {
      this.setState({ open: false });
    });
  };

  handleFiltering = e => {
    const category = e.target.innerText.trim();
    this.props.filterCategory(category);
    this.handleClose();
  };

  render() {
    const { classes, categories } = this.props;
    const { anchorEl, open } = this.state;

    return (
      <nav className={classes.fontSizeSetter}>
        <IconButton
          aria-label="Filter by category"
          aria-owns={open ? "cat-menu-list" : null}
          aria-haspopup="true"
          onClick={this.handleClick}
          title="Filter the list by category"
        >
          <FilterListIcon />
        </IconButton>
        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="bottom-end"
          className={classes.popper}
          transition
        >
          {({ TransitionProps }) => (
            <Grow {...TransitionProps} id="cat-menu-list" style={{ transformOrigin: "0 0 0" }}>
              <Paper>
                <ClickAwayListener onClickAway={this.handleClose}>
                  <MenuList role="menu">
                    <MenuItem key="all" onClick={this.handleFiltering}>
                      all posts
                    </MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category} onClick={this.handleFiltering}>
                        {category}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </nav>
    );
  }
}

CategoryFilter.propTypes = {
  classes: PropTypes.object.isRequired,
  categories: PropTypes.array.isRequired,
  filterCategory: PropTypes.func.isRequired
};

export default injectSheet(styles)(CategoryFilter);
