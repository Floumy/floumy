import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Row,
} from 'reactstrap';
import React, { useState } from 'react';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { toast } from 'react-toastify';
import { getCurrentUserMcpToken } from '../../../services/users/users.service';

export default function AiSettings() {
  const [mcpToken, setMcpToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    // Simulate fetching the MCP token
    const fetchMcpToken = async () => {
      try {
        setIsLoading(true);
        const token = await getCurrentUserMcpToken();
        console.log(token);
        setMcpToken(token);
      } catch (error) {
        toast.error('Failed to fetch MCP token');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMcpToken();
  }, []);

  return (
    <>
      <SimpleHeader />
      <Container className="mt--6" fluid id="AiSettings">
        <Row>
          <Col>
            <Card className="mb-5 shadow">
              <CardHeader className="bg-white border-0">
                <h3 className="mb-0">
                  <span class="mr-2">MCP Server Setup Instructions</span>
                  <span class="badge badge-warning badge-pill">BETA</span>
                </h3>
              </CardHeader>
              <CardBody className="pt-0">
                <Row>
                  <Col>
                    <div className="mb-4">
                      <div className="mb-5">
                        <h4 className="font-weight-bold mb-3">
                          Claude for Desktop (Free, Pro)
                        </h4>
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
    "floumy": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.floumy.com/sse"]
    }
  }
}`}</pre>
                              </div>
                            </li>
                          </ol>
                        </div>
                      </div>

                      <div className="mb-5">
                        <h4 className="font-weight-bold mb-3">Cursor</h4>
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
                                  npx mcp-remote https://mcp.floumy.com/sse
                                </code>
                              </div>
                            </li>
                            <li className="mb-3">
                              Enter the name <strong>Floumy</strong> and hit
                              enter.
                            </li>
                            <li className="mb-3">
                              Activate the server using{' '}
                              <strong>MCP: List Servers</strong> and selecting
                              Floumy, and selecting Start Server.
                            </li>
                          </ol>
                        </div>
                      </div>

                      <div className="mb-5">
                        <h4 className="font-weight-bold mb-3">Windsurf</h4>
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
    "floumy": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.floumy.com/sse"]
    }
  }
}`}</pre>
                              </div>
                            </li>
                          </ol>
                        </div>
                      </div>

                      <div className="mb-5">
                        <h4 className="font-weight-bold mb-3">Zed</h4>
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
    "floumy": {
      "command": {
        "path": "npx",
        "args": ["-y", "mcp-remote", "https://mcp.floumy.com/sse"],
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
                        The setup instructions above will use your generated
                        personal token for authentication.
                      </p>
                      <Button color="primary" className="mt-2">
                        <i className="fas fa-key mr-2"></i>Refresh Personal MCP
                        Token
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
