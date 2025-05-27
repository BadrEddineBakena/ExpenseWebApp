import React from "react";
import { NavLink } from "react-router-dom";
import {Navbar , Nav , Container} from "react-bootstrap"

const MyNavbar:React.FC = ()=>{
    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Container>
                <Navbar.Brand href="/">ExpenseApp</Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar-nav"/>
                <Navbar.Collapse id="navbar-nav">
                    <Nav >
                        <Nav.Link as={NavLink} to={"/"}>Home</Nav.Link>
                        <Nav.Link as={NavLink} to={"/SignupForm"}>Sign Up</Nav.Link>
                        <Nav.Link as={NavLink} to={"/LoginForm"}>Login</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default MyNavbar;