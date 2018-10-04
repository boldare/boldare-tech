import React from "react";
import PropTypes from "prop-types";
import injectSheet from "react-jss";
import { navigate } from "gatsby";
import classNames from "classnames";
import { Manager, Target, Popper } from "react-popper";

import { Grow, ClickAwayListener, IconButton, Paper, MenuItem, MenuList } from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";

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
  },
  popperClose: {
    pointerEvents: "none"
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

  handleClick = () => {
    this.setState({ open: !this.state.open });
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
        <Manager>
          <Target>
            <IconButton
              aria-label="More"
              aria-owns={anchorEl ? "long-menu" : null}
              aria-haspopup="true"
              onClick={this.handleClick}
            >
              <MoreVertIcon />
            </IconButton>
          </Target>
          <Popper
            placement="bottom-end"
            eventsEnabled={open}
            className={classNames({ [classes.popperClose]: !open })}
          >
            <ClickAwayListener onClickAway={this.handleClose}>
              <Grow in={open} id="menu-list" style={{ transformOrigin: "0 0 0" }}>
                <Paper>
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
                </Paper>
              </Grow>
            </ClickAwayListener>
          </Popper>
        </Manager>
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
