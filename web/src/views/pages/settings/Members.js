import SimpleHeader from '../../../components/Headers/SimpleHeader';
import { Badge, Card, CardHeader, CardTitle, Col, Container, Row, Table, UncontrolledTooltip } from 'reactstrap';
import React, { useEffect, useState } from 'react';
import { getOrg } from '../../../services/org/orgs.service';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import { formatDateWithTime, memberNameInitials, textToColor } from '../../../services/utils/utils';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { deactivateUser, updateUserRole } from '../../../services/users/users.service';
import { toast } from 'react-toastify';
import Select2 from 'react-select2-wrapper';
import { useCurrentUser } from '../../../contexts/CurrentUserContext';

function Members() {

  const [isLoading, setIsLoading] = useState(false);

  const [members, setMembers] = useState([]);
  const [invitationLink, setInvitationLink] = useState('');
  const [copiedText, setCopiedText] = useState('');
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    document.title = 'Floumy | Members';

    async function fetchOrg() {
      setIsLoading(true);
      try {
        const org = await getOrg();
        setMembers(org.members);
        const invitationToken = org.invitationToken;
        const invitationLink = `${window.location.origin}/auth/sign-up?invitationToken=${invitationToken}`;
        setInvitationLink(invitationLink);
      } catch (e) {
        console.error(e.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrg();
  }, []);

  async function deactivate(memberId) {
    setIsLoading(true);
    try {
      await deactivateUser(memberId);
      setMembers(members.map((member) => {
        if (member.id === memberId) {
          member.isActive = false;
        }
        return member;
      }));
      toast.success('The member has been deactivated');
    } catch (e) {
      toast.error('The member could not be deactivated');
    } finally {
      setIsLoading(false);
    }
  }

  const handleRoleChange = async (memberId, newRole) => {
    if(newRole.trim() === '') {
      return;
    }
    if(memberId === currentUser?.id) {
      toast.error('You cannot change your own role');
      return;
    }
    setIsLoading(true);
    try {
      await updateUserRole(memberId, newRole);
      setMembers(members.map((member) => {
        if (member.id === memberId) {
          return { ...member, role: newRole };
        }
        return member;
      }));
      toast.success('Role updated successfully');
    } catch (e) {
      toast.error('Failed to update role');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <SimpleHeader />
      <Container className="mt--6" fluid>
        <Row>
          <Col>
            <Card className="mb-5">
              <CardHeader className="rounded-lg">
                <Row>
                  <Col xs={12} md={8}>
                    <CardTitle tag="h2" className="mb-3">Members</CardTitle>
                  </Col>
                  <Col xs={12} md={4}>
                    {currentUser?.role === 'admin' &&
                      <div className="text-xs-left text-sm-right">
                        <CopyToClipboard
                          text={invitationLink}
                          onCopy={() => setCopiedText(invitationLink)}
                        >
                          <button id="copy-invite-link" className="btn btn-primary" type="button">
                            Invite with link <i className="fas fa-link ml-2" />
                          </button>
                        </CopyToClipboard>
                        <UncontrolledTooltip
                          delay={0}
                          trigger="hover focus"
                          target="copy-invite-link"
                        >
                          {copiedText === invitationLink
                            ? 'Link copied to clipboard'
                            : 'Copy invite link to clipboard'}
                        </UncontrolledTooltip>
                      </div>}
                  </Col>
                </Row>
              </CardHeader>
              {isLoading && <LoadingSpinnerBox />}
              <div className="table-responsive">
                {!isLoading && <Table className="align-items-center table-flush border-bottom no-select"
                                      style={{ minWidth: '700px' }}
                                      onContextMenu={(e) => e.preventDefault()}
                >
                  <thead className="thead-light">
                  <tr>
                    <th scope="col" width="30%">Name</th>
                    <th scope="col" width="20%">Email</th>
                    <th scope="col" width="20%">
                      Role
                      <i id="tooltip-role" className="fa fa-info-circle ml-2" />
                      <UncontrolledTooltip
                        trigger="hover focus"
                        target="tooltip-role"
                      >
                        <span>
                          <strong>Contributor:</strong> can view and edit the project content.<br />
                          <strong>Admin:</strong> can manage projects and members.<br />
                        </span>
                      </UncontrolledTooltip>
                    </th>
                    <th scope="col" width="10%">Status</th>
                    <th scope="col" width="10%">Created at</th>
                    {currentUser?.role === 'admin' && <th scope="col" width="10%"></th>}
                  </tr>
                  </thead>
                  <tbody className="list">
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center">
                        No members found.
                      </td>
                    </tr>
                  )}
                  {members.length > 0 && members.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <span
                          style={{ backgroundColor: textToColor(member.name) }}
                          className="avatar avatar-xs rounded-circle mr-2">
                          {memberNameInitials(member.name)}
                        </span>
                        <span>{member.name}</span>
                      </td>
                      <td>
                        {member.email}
                      </td>
                      <td>
                        <div className="d-flex flex-column">
                          {currentUser?.role !== 'admin' || member.id === currentUser?.id|| !member.isActive ? <>
                            <span className="text-muted text-capitalize">{member.role}</span>
                          </> : <>
                            <Select2
                              className="react-select-container"
                              value={member.role || 'contributor'}
                              onChange={(e) => handleRoleChange(member.id, e.target.value)}
                              disabled={!member.isActive || member.id === localStorage.getItem('currentUserId')}
                              data={[
                                { id: 'ADMIN', text: 'Admin' },
                                { id: 'CONTRIBUTOR', text: 'Contributor' },
                              ]}
                            />
                          </>}
                        </div>
                      </td>
                      <td>
                        {member.isActive &&
                          <Badge className="badge-lg" color="success">
                            Active
                          </Badge>}
                        {!member.isActive &&
                          <Badge className="badge-lg" color="danger">
                            Inactive
                          </Badge>}
                      </td>
                      <td>
                        {formatDateWithTime(member.createdAt)}
                      </td>
                      {currentUser?.role === 'admin' &&
                        <td>
                          <div className="d-flex justify-content-end">
                            <button className="btn btn-sm btn-danger" type="button"
                                    onClick={() => deactivate(member.id)}
                                    disabled={member.id === localStorage.getItem('currentUserId') || !member.isActive}>
                              Deactivate
                            </button>
                          </div>
                        </td>
                      }
                    </tr>
                  ))}
                  </tbody>
                </Table>}
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Members;
