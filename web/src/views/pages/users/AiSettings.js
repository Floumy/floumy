import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Row,
} from 'reactstrap';
import React from 'react';
import SimpleHeader from '../../../components/Headers/SimpleHeader';

export default function AiSettings() {
  return (
    <>
      <SimpleHeader />
      <Container className="mt--6" fluid id="AiSettings">
        <Row>
          <Col>
            <Card className="mb-5 shadow">
              <CardHeader className="bg-white border-0">
                <h3 className="mb-0">AI Settings</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <Row>
                  <Col>
                    <h4 className="mt-4 mb-3 text-lg">
                      MCP Server Setup Instructions
                    </h4>
                    <div className="mb-4">
                      <div className="mb-5">
                        <h5 className="font-weight-bold mb-3">
                          Claude.ai (Team, Enterprise)
                        </h5>
                        <div className="pl-4 border-left border-light">
                          <ol className="pl-3">
                            <li className="mb-3">
                              Navigate to Settings in the sidebar on web or
                              desktop
                            </li>
                            <li className="mb-3">
                              Scroll to Integrations at the bottom and click Add
                              more
                            </li>
                            <li className="mb-3">
                              In the prompt enter:
                              <div className="bg-light p-3 rounded mt-2 mb-2">
                                <p className="mb-1">
                                  <strong>Integration name:</strong> Linear
                                </p>
                                <p className="mb-0">
                                  <strong>Integration URL:</strong>{' '}
                                  https://mcp.linear.app/sse
                                </p>
                              </div>
                            </li>
                            <li>
                              Make sure to enable the tools in any new chats
                            </li>
                          </ol>
                        </div>
                      </div>

                      <div className="mb-5">
                        <h5 className="font-weight-bold mb-3">
                          Claude for Desktop (Free, Pro)
                        </h5>
                        <div className="pl-4 border-left border-light">
                          <ol className="pl-3">
                            <li className="mb-3">
                              Open the file{' '}
                              <code>
                                ~/Library/Application
                                Support/Claude/claude_desktop_config.json
                              </code>
                            </li>
                            <li className="mb-3">
                              Add the following and restart the Claude desktop
                              app:
                              <div className="bg-light p-3 rounded mt-2 mb-2 code-block">
                                <pre className="mb-0">{`{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.linear.app/sse"]
    }
  }
}`}</pre>
                              </div>
                            </li>
                          </ol>
                        </div>
                      </div>

                      <div className="mb-5">
                        <h5 className="font-weight-bold mb-3">Cursor</h5>
                        <div className="pl-4 border-left border-light">
                          <p className="mb-3">
                            Install here, or from Cursor's MCP tools page.
                          </p>
                          <ol className="pl-3">
                            <li className="mb-3">
                              CTRL/CMD+P and search for{' '}
                              <strong>MCP: Add Server</strong>.
                            </li>
                            <li className="mb-3">
                              Select <strong>Command (stdio)</strong>
                            </li>
                            <li className="mb-3">
                              Enter the following configuration, and hit enter.
                              <div className="bg-light p-3 rounded mt-2 mb-2">
                                <code>
                                  npx mcp-remote https://mcp.linear.app/sse
                                </code>
                              </div>
                            </li>
                            <li className="mb-3">
                              Enter the name <strong>Linear</strong> and hit
                              enter.
                            </li>
                            <li className="mb-3">
                              Activate the server using{' '}
                              <strong>MCP: List Servers</strong> and selecting
                              Linear, and selecting Start Server.
                            </li>
                          </ol>
                        </div>
                      </div>

                      <div className="mb-5">
                        <h5 className="font-weight-bold mb-3">Windsurf</h5>
                        <div className="pl-4 border-left border-light">
                          <ol className="pl-3">
                            <li className="mb-3">
                              CTRL/CMD + , to open Windsurf settings.
                            </li>
                            <li className="mb-3">
                              Under Scroll to Cascade -> MCP servers
                            </li>
                            <li className="mb-3">
                              Select Add Server -> Add custom server
                            </li>
                            <li className="mb-3">
                              Add the following:
                              <div className="bg-light p-3 rounded mt-2 mb-2 code-block">
                                <pre className="mb-0">{`{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.linear.app/sse"]
    }
  }
}`}</pre>
                              </div>
                            </li>
                          </ol>
                        </div>
                      </div>

                      <div className="mb-5">
                        <h5 className="font-weight-bold mb-3">Zed</h5>
                        <div className="pl-4 border-left border-light">
                          <ol className="pl-3">
                            <li className="mb-3">
                              CMD+, to open Zed settings.
                            </li>
                            <li className="mb-3">
                              Add the following:
                              <div className="bg-light p-3 rounded mt-2 mb-2 code-block">
                                <pre className="mb-0">{`{
  "context_servers": {
    "linear": {
      "command": {
        "path": "npx",
        "args": ["-y", "mcp-remote", "https://mcp.linear.app/sse"],
        "env": {}
      },
      "settings": {}
    }
  }
}`}</pre>
                              </div>
                            </li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-muted mb-3">
                        <i className="fas fa-info-circle mr-2"></i>
                        The setup instructions above will use your generated API
                        key for authentication.
                      </p>
                      <Button color="primary" className="mt-2">
                        <i className="fas fa-key mr-2"></i>Generate API Key
                      </Button>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
