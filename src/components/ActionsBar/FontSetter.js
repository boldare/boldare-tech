import React from "react";
import PropTypes from "prop-types";
import injectSheet from "react-jss";
import {
  Grow,
  Paper,
  Popper,
  ClickAwayListener,
  IconButton,
  MenuItem,
  MenuList
} from "@mui/material";
import FormatSizeIcon from "@mui/icons-material/FormatSize";

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
  }
});

class FontSetter extends React.Component {
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

  handleSetting = e => {
    const val = e.target.innerText.replace("%", "");
    const factor = +val / 100;
    this.props.increaseFont(factor);
    this.handleClose();
  };

  render() {
    const { classes } = this.props;
    const { anchorEl, open } = this.state;

    return (
      <nav className={classes.fontSizeSetter}>
        <IconButton
          aria-label="Increase font size"
          aria-owns={open ? "font-menu-list" : null}
          aria-haspopup="true"
          onClick={this.handleClick}
          title="Change font size"
        >
          <FormatSizeIcon />
        </IconButton>
        <Popper open={open} anchorEl={anchorEl} placement="bottom-end" transition>
          {({ TransitionProps }) => (
            <Grow {...TransitionProps} id="font-menu-list" style={{ transformOrigin: "0 0 0" }}>
              <Paper>
                <ClickAwayListener onClickAway={this.handleClose}>
                  <MenuList role="menu">
                    <MenuItem onClick={this.handleSetting}>150%</MenuItem>
                    <MenuItem onClick={this.handleSetting}>125%</MenuItem>
                    <MenuItem onClick={this.handleSetting}>100%</MenuItem>
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

FontSetter.propTypes = {
  classes: PropTypes.object.isRequired,
  increaseFont: PropTypes.func.isRequired
};

export default injectSheet(styles)(FontSetter);
