import React from "react";
import PropTypes from "prop-types";
import injectSheet from "react-jss";
import { navigate } from "gatsby";
import {
  Grow,
  Popper,
  ClickAwayListener,
  IconButton,
  Paper,
  MenuItem,
  MenuList
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const styles = theme => ({
  topMenu: {
    float: "right",
    margin: "5px 10px 0 0",
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

class TopMenu extends React.Component {
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

  render() {
    const { classes, pages } = this.props;
    const { anchorEl, open } = this.state;

    return (
      <nav className={classes.topMenu}>
        <IconButton
          aria-label="More"
          aria-owns={open ? "menu-list" : null}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          <MoreVertIcon />
        </IconButton>
        <Popper open={open} anchorEl={anchorEl} placement="bottom-end" transition>
          {({ TransitionProps }) => (
            <Grow {...TransitionProps} id="menu-list" style={{ transformOrigin: "0 0 0" }}>
              <Paper>
                <ClickAwayListener onClickAway={this.handleClose}>
                  <MenuList role="menu">
                    <MenuItem
                      onClick={e => {
                        this.props.homeLinkOnClick(e);
                        this.handleClose();
                      }}
                    >
                      Home
                    </MenuItem>
                    {pages.map((page, i) => {
                      const {
                        childMarkdownRemark: { fields, frontmatter }
                      } = page.node;

                      return (
                        <a key={fields.slug} href={fields.slug} style={{ display: "block" }}>
                          <MenuItem
                            onClick={e => {
                              this.props.pageLinkOnClick(e);
                              this.handleClose();
                            }}
                          >
                            {frontmatter.menuTitle ? frontmatter.menuTitle : frontmatter.title}
                          </MenuItem>
                        </a>
                      );
                    })}
                    <MenuItem
                      onClick={e => {
                        this.props.pageLinkOnClick(e);
                        this.handleClose();
                        navigate("/tags");
                      }}
                    >
                      Most popular tags
                    </MenuItem>
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

TopMenu.propTypes = {
  pages: PropTypes.array.isRequired,
  classes: PropTypes.object.isRequired,
  pageLinkOnClick: PropTypes.func.isRequired,
  homeLinkOnClick: PropTypes.func.isRequired
};

export default injectSheet(styles)(TopMenu);
